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
        myDidDoc: myDidDoc
    }

    // Update invitation record
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
    
    // Update connection record
    await indy.wallet.addWalletRecord(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        JSON.stringify(connection), 
        {}
    );

    if(autoAccept) {
        connection = (await acceptInvitationAndSendRequest(connection.connectionId)).connection
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
    connection.myDid = myDid;
    connection.myVerkey = myVerkey;
    connection.myDidDoc = myDidDoc;

    const connectionRequest = messages.createConnectionRequestMessage(myDid, myDidDoc);
    
    // Prepare and send connection request
    let [message, endpoint] = await indy.messages.prepareMessage(
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
        connection.myDidDoc
    );
    const signedConnectionResponse = await indy.wallet.sign(
        connectionResponse, 
        'connection', 
        connection.invitation.myVerkey
    );

    let [message, endpoint] = await indy.messages.prepareMessage(
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

    let [message, endpoint] = await indy.messages.prepareMessage(connectionAck, connection);
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
    const [did, verkey, didDoc] = await indy.didDoc.createDidAndDidDoc();
    return {
        connectionId: uuid(),
        myDid: did,
        myVerkey: verkey,
        myDidDoc: didDoc,
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

exports.getConnection = async (connectionId) => {
    return await indy.wallet.getWalletRecord(
        indy.recordTypes.RecordType.Connection, 
        connectionId, 
        {}
    );
}

exports.searchConnection = async (query) => {
    return await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.Connection,
        query, 
        {}
    );
}

exports.getAllConnections = async () => {
    return await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.Connection, 
        {}, 
        {}
    );
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
