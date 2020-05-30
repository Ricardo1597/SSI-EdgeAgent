'use strict';
const sdk = require('indy-sdk');
const indy = require('../../../index.js');
const uuid = require('uuid');
const messages = require('./messages')
const generalTypes = require('../generalTypes');

exports.handlers = require('./handlers');

exports.MessageType = messages.MessageType;

const ConnectionState = {
    Init: "init",
    Invited: "invited",
    Requested: "requested",
    Responded: "responded",
    Complete: "complete",
    Error: "error"
}

exports.ConnectionState = ConnectionState
  

exports.decodeInvitationFromUrl = function (invitationUrl) {
    const encodedInvitation = invitationUrl.split('c_i=')[1];
    const invitation = JSON.parse(Buffer.from(encodedInvitation, 'base64').toString());
    return invitation;
}
  
exports.encodeInvitationToUrl = function (invitation) {
    const encodedInvitation = Buffer.from(JSON.stringify(invitation)).toString('base64');
    const invitationUrl = `https://example.com/ssi?c_i=${encodedInvitation}`;
    return invitationUrl;
}
  

exports.createInvitation = async (myDid, myVerkey, myDidDoc, invitationAlias, isPublic=false, multiUse=true) => {

    const invitationDetails = createInvitationDetails(myDidDoc);
    const invitationMessage = await messages.createInvitationMessage(invitationDetails);

    let invitation = {
        invitationId: uuid(),
        invitation: invitationMessage,
        alias: invitationAlias,
        multiUse: multiUse,
        timesUsed: 0,
        myDid: myDid,
        myVerkey: myVerkey,
        public: isPublic
    }

    // Add invitation record to the wallet
    await indy.wallet.addWalletRecord(
        indy.recordTypes.RecordType.Invitation, 
        invitation.invitationId, 
        JSON.stringify(invitation), 
        {'myVerkey': invitation.myVerkey}
    );

    return invitationMessage;
}


exports.receiveInvitation = async (connectionAlias, invitation, autoAccept=false) => {
    // Validate id verkey in invitation is the same as in the did document agent service.
    // (only if did document is in a blockchain)
    if(invitation.did.split(':')[1] !== "peer") {
        validateInvitationKeys(invitation.did, invitation.recipientKeys);
    }

    let connection = {
        connectionId: uuid(),     
        state: ConnectionState.Invited,
        initiator: generalTypes.Initiator.External,
        alias: connectionAlias,
        invitation: invitation
    };
    
    // Add connection record to the wallet
    await this.addConnection(
        connection.connectionId, 
        JSON.stringify(connection), 
        {}
    );

    if(autoAccept) {
        connection = await acceptInvitationAndSendRequest(connection.connectionId);
    }

    return connection;
}

exports.acceptInvitationAndSendRequest = async (connectionId) => {
    let connection = await this.getConnection(connectionId);

    if(connection.state != ConnectionState.Invited){
        throw new Error(`Invalid state trasition.`)
    }

    // Create did and did document for this specific connection
    const options = {method_name: 'peer'};
    const [myDid, myVerkey, myDidDoc] = await indy.didDoc.createDidAndDidDoc(options);    
    console.log("DID Document:", myDidDoc.service[0])
    
    // Save created did document in the wallet
    await indy.didDoc.addLocalDidDocument(myDidDoc);

    connection.myDid = myDid;
    connection.myVerkey = myVerkey;

    const connectionRequest = messages.createConnectionRequestMessage(myDid, myDidDoc);
    
    // Prepare and send connection request
    const [message, endpoint] = await indy.messages.prepareMessage(
        connectionRequest, 
        connection,
        connection.invitation
    );
    indy.messages.sendMessage(message, endpoint);

    // Update connection record
    connection.threadId = connectionRequest['@id'];
    connection.state = ConnectionState.Requested;
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        JSON.stringify(connection)
    );
    await indy.wallet.updateWalletRecordTags(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        {'myVerkey': myVerkey}
    );
    
    return connection;
}

exports.createAndSendResponse = async (connectionId) => {
    let connection = await this.getConnection(connectionId);

    if(connection.state != ConnectionState.Requested){
        throw new Error(`Invalid state trasition.`)
    }

    const connectionResponse = messages.createConnectionResponseMessage(
        connection.threadId,
        connection.myDid,
        await indy.did.resolveDid(connection.myDid)
    );
    const signedConnectionResponse = await indy.wallet.sign(
        connectionResponse, 
        'connection', 
        connection.invitation.myVerkey
    );

    const [message, endpoint] = await indy.messages.prepareMessage(
        signedConnectionResponse, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);
    
    // Update connection record
    connection.state = ConnectionState.Responded;
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        JSON.stringify(connection)
    );
  
    return connection;
}


exports.createAndSendAck = async (connectionId) => {
    let connection = await this.getConnection(connectionId);
    console.log(connection)
    if(connection.state != ConnectionState.Responded){
        throw new Error(`Invalid state trasition.`)
    }
    const connectionAck = messages.createAckMessage(connection.threadId);

    const [message, endpoint] = await indy.messages.prepareMessage(connectionAck, connection);
    indy.messages.sendMessage(message, endpoint);

    // Update connection record
    connection.state = ConnectionState.Complete;
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        JSON.stringify(connection)
    );

    return connection;
}

exports.createPeerDidConnection = async (initiator, threadId, state=null) => {
    if(!state) {
        state = ConnectionState.Init;
    }
    const [did, verkey, didDoc] = await this.getDidAndDocument(false);
    
    return {
        connectionId: uuid(),
        myDid: did,
        myVerkey: verkey,
        state: state,
        initiator: initiator,
        threadId: threadId
    }
}


exports.createPublicDidConnection = async (did, initiator, threadId, state=null) => {
    if(!state) {
        state = ConnectionState.Init;
    }
    const [myDid, myVerkey, myDidDoc] = await this.getDidAndDocument(true, did);

    return {
        connectionId: uuid(),
        myDid: myDid,
        myVerkey: myVerkey,
        state: state,
        initiator: initiator,
        threadId: threadId
    }
}


exports.getDidAndDocument = async (isPublic, myDid=null) => {
    let myVerkey = null;
    let myDidDoc = {};

    if(isPublic) {
        if(!myDid){
            console.log('No did provided');
            myDid = await indy.did.getEndpointDid();
        }
        // Get agent service recipient key and did document to create a public invitation
        myDidDoc = await indy.did.resolveDid(myDid);
        console.log(myDidDoc);
        // Look for one agent service recipient key in the did document
        if(!myDidDoc) {
            throw new Error('No document found for the provided did')
        }
        if(!myDidDoc.service || myDidDoc.service.length == 0) {
            throw new Error('No agent service provided')
        }
        for(let service of myDidDoc.service){
            if(service.type == "agent" && service.recipientKeys && service.recipientKeys.length > 0){
                myVerkey = service.recipientKeys[0];
                break;
            }
        }
        if(myVerkey === null) {
            throw new Error('No agent service recipient keys provided')
        }
      } else {
        // Create local did and did document
        const options = {method_name: 'peer'};
        [myDid, myVerkey, myDidDoc] = await indy.didDoc.createDidAndDidDoc(options);
    
        // Save created did document in the wallet
        await indy.didDoc.addLocalDidDocument(myDidDoc);
      }
      return [myDid, myVerkey, myDidDoc];
}

const createInvitationDetails = (myDidDoc) => {
    return {
        did: myDidDoc.id,
        recipientKeys: myDidDoc.service[0].recipientKeys,
        serviceEndpoint: myDidDoc.service[0].serviceEndpoint,
        routingKeys: myDidDoc.service[0].routingKeys,
    };
}

exports.validateSenderKey = async (theirDid, senderKey) => { 
    const theirDidDoc = await indy.did.resolveDid(theirDid);
    const theirKeys = theirDidDoc.service[0].recipientKeys;
    if (theirKeys.indexOf(senderKey) == -1) {
        throw new Error(
            `Inbound message 'sender_key' ${senderKey} is different from theirKey ${theirKey}`
        );
    }
}

const validateInvitationKeys = async (did, recipientKeys) => {
    const didDoc = await indy.did.resolveDid(did);
    const servicekeys = didDoc.service[0].recipientKeys;
    for (let key of recipientKeys) {
        if (servicekeys.indexOf(key) == -1) {
            throw new Error(
                `Inbound message invitation key ${key} is not in agent service recipient keys.`
            );
        }
    }
}

exports.getConnection = async (connectionId) => {
    try {
        return await indy.wallet.getWalletRecord(
            indy.recordTypes.RecordType.Connection, 
            connectionId, 
            {}
        );
    } catch(error) {
        if(error.indyCode && error.indyCode === 212){
            console.log("Unable to get connection record. Wallet item not found.");
        }
        return null;
    }
}

exports.searchConnection = async (query) => {
    const connections = await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.Connection,
        query, 
        {}
    );

    if(connections.length < 1){
        console.log("Unable to get connection record. Wallet item not found.");
        return null;
    }

    return connections[0];
}

exports.getAllConnections = async () => {
    return await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.Connection, 
        {}, 
        {}
    );
}

exports.addConnection = async (id, value, tags={}) => {
    try {
        return await indy.wallet.addWalletRecord(
            indy.recordTypes.RecordType.Connection,
            id,
            value,
            tags
        );
    } catch(error) {
        if(error.indyCode && error.indyCode === 213){
            console.log("Unable to add connection record. Wallet item already exists.");
        }
        // throw error;
    }
}

exports.removeConnection = async (connectionId) => {
    return await indy.wallet.deleteWalletRecord(
        indy.recordTypes.RecordType.Connection, 
        connectionId, 
    );
}

// accept identity proof request, send identity proof and own proof request on identity

// accept identity proof (use same above to respond to identity proof)

// show in UI unverified relationships to be verified by the user.

// Relationship must be verified in order to issue credential to them.
