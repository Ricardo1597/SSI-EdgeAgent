'use strict';
const sdk = require('indy-sdk');
const indy = require('../../../index.js');
const uuid = require('uuid');
const messages = require('./messages')
const generalTypes = require('../generalTypes');
const { connection } = require('mongoose');
const QRCode = require('qrcode');

exports.handlers = require('./handlers');

exports.MessageType = messages.MessageType;
exports.NewMessageType = messages.NewMessageType;

const ConnectionState = {
    Init: "init",
    Invited: "invited",
    Requested: "requested",
    Responded: "responded",
    Complete: "complete",
    Error: "error"
}

exports.ConnectionState = ConnectionState
  
exports.RejectionErrors = {
    Request: {
        state: ConnectionState.Requested,
        code: "request_not_accepted",
        description: "Connection request rejected."
    },
    Response: {
        state: ConnectionState.Responded,
        code: "response_not_accepted",
        description: "Connection response rejected."
    }
}

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
  

exports.createInvitation = async (myDid, myVerkey, myDidDoc, invitationAlias, isPublic=false, multiuse=true) => {
    // // Check if provided verkey was never used
    // const invitations = await indy.wallet.searchWalletRecord(
    //     indy.recordTypes.RecordType.Invitation,
    //     {'myDid': myDid, 'myVerkey': myVerkey},
    //     {}
    // );
    // if(invitations.length > 0) {
    //     throw new Error(`Invitation already created with DID ${myDid}. Please use another verkey.`);
    // }

    const invitationMessage = messages.createInvitationMessage(myDidDoc, isPublic);
    const invitationURL = this.encodeInvitationToUrl(invitationMessage);
    const qrCode = QRCode.create(invitationURL);
    console.log(qrCode);

    const currentDate = indy.utils.getCurrentDate();

    let invitation = {
        invitationId: invitationMessage['@id'],
        invitation: invitationMessage,
        alias: invitationAlias,
        isMultiuse: multiuse,
        timesUsed: 0,
        myDid: myDid,
        myVerkey: myVerkey,
        isPublic: isPublic,
        isActive: true,
        createdAt: currentDate,
        updatedAt: currentDate,
    }

    // Add invitation record to the wallet
    await indy.wallet.addWalletRecord(
        indy.recordTypes.RecordType.Invitation, 
        invitation.invitationId, 
        JSON.stringify(invitation), 
        {}
    );

    return [invitationMessage, invitationURL, qrCode];
}


exports.receiveInvitation = async (connectionAlias, invitation, autoAccept=false) => {
    // This is not needed because now we get the recipient key directly from the blockchain.
    // // Validate id verkey in invitation is the same as in the did document agent service.
    // // (only if did document is in a blockchain)
    // if(invitation.did.split(':')[1] !== "peer") {
    //     validateInvitationKeys(invitation.did, invitation.recipientKeys);
    // }

    const currentDate = indy.utils.getCurrentDate()

    let connection = {
        connectionId: uuid(),     
        state: ConnectionState.Invited,
        initiator: generalTypes.Initiator.External,
        alias: connectionAlias,
        invitation: invitation,
        createdAt: currentDate,
        updatedAt: currentDate,
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
    const [myDid, myVerkey, myDidDoc] = await indy.didDoc.createDidAndDidDoc("Connection: " + connection.alias, options);    
    
    // Save created did document in the wallet
    await indy.didDoc.addLocalDidDocument(myDidDoc);

    connection.myDid = myDid;
    connection.myVerkey = myVerkey;

    const connectionRequest = messages.createConnectionRequestMessage(
        myDid, 
        myDidDoc,
        connection.invitation['@id']
    );
    
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
    connection.updatedAt = indy.utils.getCurrentDate();
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


// See what to do with the record after rejecting the invitation. Keep it or 
// remove it? For know it will be kept with the reject error message. 
exports.rejectInvitation = async (connectionId) => {
    let connection = await this.getConnection(connectionId);

    if(connection.state != ConnectionState.Invited){
        throw new Error(`Invalid state trasition.`)
    }

    // Update connection record
    connection.state = ConnectionState.Error;
    connection.error = {
        self: true,
        description: {
            en: "Connection invitation rejected.",
            code: "incitation_not_accepted"
        }
    };
    connection.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        JSON.stringify(connection)
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
    connection.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        JSON.stringify(connection)
    );
  
    return connection;
}


// Using problem report protocol for hadling rejections
exports.rejectExchange = async (connectionId, rejectError) => {
    const connectionRecord = await this.getConnection(connectionId);

    return await indy.problemReport.sendProblemReport(
        connectionRecord,
        connectionId,
        rejectError,
        "connection",
        this.MessageType.ProblemReport,
        indy.recordTypes.RecordType.Connection,
        ConnectionState.Error
    );
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
    connection.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        JSON.stringify(connection)
    );

    return connection;
}

exports.createPeerDidConnection = async (initiator, alias, threadId, state=null) => {
    if(!state) {
        state = ConnectionState.Init;
    }
    const [did, verkey, didDoc] = await this.getDidAndDocument(false, alias);

    const currentDate = indy.utils.getCurrentDate();
    
    return {
        connectionId: uuid(),
        myDid: did,
        myVerkey: verkey,
        state: state,
        initiator: initiator,
        threadId: threadId,
        createdAt: currentDate,
        updatedAt: currentDate,
    }
}


// exports.createPublicDidConnection = async (did, initiator, threadId, state=null) => {
//     if(!state) {
//         state = ConnectionState.Init;
//     }
//     const [myDid, myVerkey, myDidDoc] = await this.getDidAndDocument(true, did);

//     const currentDate = indy.utils.getCurrentDate();

//     return {
//         connectionId: uuid(),
//         myDid: myDid,
//         myVerkey: myVerkey,
//         state: state,
//         initiator: initiator,
//         threadId: threadId,
//         createdAt: currentDate,
//         updatedAt: currentDate,
//     }
// }


exports.getDidAndDocument = async (isPublic, alias, myDid=null) => {
    let myVerkey = null;
    let myDidDoc = {};

    if(isPublic) {
        if(!myDid){
            console.log('No did provided');
            myDid = await indy.did.getEndpointDid();
        }
        // Get agent service recipient key and did document to create a public invitation
        myDidDoc = await indy.did.resolveDid(myDid);
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
        [myDid, myVerkey, myDidDoc] = await indy.didDoc.createDidAndDidDoc("Connection: " + alias, options);
    
        // Save created did document in the wallet
        await indy.didDoc.addLocalDidDocument(myDidDoc);
      }
      return [myDid, myVerkey, myDidDoc];
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
            return null;
        } else {
            throw error;
        }
    }
}

exports.searchConnections = async (query, all=false) => {
    const connections = await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.Connection,
        query, 
        {}
    );

    if(connections.length < 1){
        console.log("Unable to get connection record. Wallet item not found.");
        return null;
    }

    return all ? connections : connections[0];
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
        } else {
            throw error;
        }
    }
}

exports.removeConnection = async (connectionId) => {
    let connection = await this.getConnection(connectionId);

    const abandonConnectionMessage = indy.problemReport.messages.createProblemReportMessage(
        indy.connections.MessageType.ProblemReport,
        "connection_abandoned",
        "Connection abandoned.",
        "connection",
        connection.threadId
    );

    const [message, endpoint] = await indy.messages.prepareMessage(
        abandonConnectionMessage, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);

    await indy.wallet.deleteWalletRecord(
        indy.recordTypes.RecordType.Connection, 
        connectionId, 
    );
}


exports.getInvitation = async (invitationId) => {
    console.log("Aqui: ",invitationId)
    try {
        return await indy.wallet.getWalletRecord(
            indy.recordTypes.RecordType.Invitation, 
            invitationId, 
            {}
        );
    } catch(error) {
        if(error.indyCode && error.indyCode === 212){
            console.log("Unable to get invitation record. Wallet item not found.");
            return null;
        } else {
            throw error;
        }
    }
}

exports.getAllInvitations = async () => {
    return await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.Invitation, 
        {}, 
        {}
    );
}

exports.removeInvitation = async (invitationId) => {
    return await indy.wallet.deleteWalletRecord(
        indy.recordTypes.RecordType.Invitation, 
        invitationId, 
    );
}

// accept identity proof request, send identity proof and own proof request on identity

// accept identity proof (use same above to respond to identity proof)

// show in UI unverified relationships to be verified by the user.

// Relationship must be verified in order to issue credential to them.
