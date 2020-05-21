'use strict';
const sdk = require('indy-sdk');
const indy = require('../../../index.js');
const uuid = require('uuid');
const messages = require('./messages')
const generalTypes = require('../generalTypes');

exports.handlers = require('./handlers');

exports.MessageType = messages.MessageType;

const ConnectionState = {
    Null: "null",
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
  

exports.createInvitation = async (invitationAlias, multiUse=true) => {
    // Create did and did document to support the invitation
    const [myDid, myVerkey, myDidDoc] = await indy.didDoc.createDidAndDidDoc();

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
    }

    // Save created did document in the wallet
    await indy.didDoc.addLocalDidDocument(myDidDoc);

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
    const [myDid, myVerkey, myDidDoc] = await indy.didDoc.createDidAndDidDoc();    
    
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
        await indy.didDoc.getLocalDidDocument(connection.myDid)
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


exports.createConnection = async (initiator, threadId, state=null) => {
    if(!state) {
        state = ConnectionState.Null;
    }
    // option: { method_name: 'sov' }
    const [did, verkey, didDoc] = await indy.didDoc.createDidAndDidDoc({});
    await indy.didDoc.addLocalDidDocument(didDoc);
    return {
        connectionId: uuid(),
        myDid: did,
        myVerkey: verkey,
        state: state,
        initiator: initiator,
        threadId, threadId
    }
}

const createInvitationDetails = (myDidDoc) => {
    return {
        recipientKeys: myDidDoc.service[0].recipientKeys,
        serviceEndpoint: myDidDoc.service[0].serviceEndpoint,
        routingKeys: myDidDoc.service[0].routingKeys,
    };
}

exports.validateSenderKey = async (theirDid, senderKey) => { 
    // TODO: < Get did document here instead of saving it in the connection record >
    const theirDidDoc = await indy.did.resolveDid(theirDid);

    const theirKey = theirDidDoc.service[0].recipientKeys[0];
    if (theirKey !== senderKey) {
        throw new Error(
            `Inbound message 'sender_key' ${senderKey} is different from connection.theirKey ${theirKey}`
        );
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
        throw error;
    }
}

exports.searchConnection = async (query) => {
    const connections = await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.Connection,
        query, 
        {}
    );

    if(connections.length < 1)
        throw new Error(`Connection not found!`);

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
        throw error;
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
