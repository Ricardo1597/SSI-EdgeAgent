'use strict';
const indy = require('../../../index.js');
const connectionsIndex = require('./index');
const generalTypes = require('../generalTypes');

exports.requestHandler = async (decryptedMessage) => {
    const {message, recipientVerkey, senderVerkey} = decryptedMessage

    if (!message.connection) 
        throw new Error('Invalid message');

    if(!message.connection.did_doc) 
        throw new Error('No DIDDoc provided.')
    if(message.connection.did != message.connection.did_doc.id) 
        throw new Error("Connection Did does not match DidDoc id.")
    if (!message.connection.did_doc.service[0].recipientKeys[0]) 
        throw new Error('No service recipient keys provided.');

    const invitations = await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.Invitation,
        {'myVerkey': recipientVerkey},
        {}
    );
    if(invitations.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);
    let invitation = invitations[0]

    if(!invitation.multiUse && invitation.timesUsed > 0) {
        throw new Error('Invitation can only be used once!');
    }

    let connection = await connectionsIndex.createConnection(
        generalTypes.Initiator.Self,
        message['@id']
    );
    
    // Update connection record
    connection.invitation = invitation;
    connection.theirDid = message.connection.did;
    connection.theirDidDoc = message.connection.did_doc;
    connection.state = connectionsIndex.ConnectionState.Requested;
    await indy.wallet.addWalletRecord(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        JSON.stringify(connection),
        {'myVerkey': connection.myVerkey}
    );

    let autoAccept = false // REMOVE LATER AND USE USER OPTION
    if(autoAccept)
        await indy.connections.createAndSendResponse(connection.connectionId);
    
    console.log("Connection Id created in request handler: ", connection.connectionId);

    return null;
};

exports.responseHandler = async (decryptedMessage) => {
    const { message, recipient_verkey, sender_verkey } = decryptedMessage;

    const originalMessage = await indy.wallet.verify(message, 'connection');

    if(!originalMessage.connection.did_doc) 
        throw new Error('No DIDDoc provided.')
    if(originalMessage.connection.did != originalMessage.connection.did_doc.id) 
        throw new Error("Connection Did does not match DidDoc id.")
    if (!originalMessage.connection.did_doc.service[0].recipientKeys[0]) 
        throw new Error('No service recipient keys provided.');


    // validateSenderKey(connection, sender_verkey);

    let connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );
    if(connections.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);

    let connection = connections[0]

    if(connection.state != connectionsIndex.ConnectionState.Requested){
        throw new Error(`Invalid state trasition.`)
    }

    if (!message['connection~sig'])
      throw new Error('Invalid message');


    // Update connection record
    connection.theirDid = originalMessage.connection.did;
    connection.theirDidDoc = originalMessage.connection.did_doc;
    connection.state = connectionsIndex.ConnectionState.Responded;
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.Connection, 
        connection.connectionId, 
        JSON.stringify(connection)
    );

    let autoAccept = true // REMOVE LATER AND USE USER OPTION
    if(autoAccept)
        await indy.connections.createAndSendAck(connection.connectionId);

    return null;
};

exports.acknowledgeHandler = async (decryptedMessage) => {
    const { message, recipient_verkey, sender_verkey } = decryptedMessage;

    let connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );
    if(connections.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);

    let connection = connections[0]

    if(connection.state != connectionsIndex.ConnectionState.Responded){
        throw new Error(`Invalid state trasition.`)
    }
    
    if (!message['status'])
        throw new Error('Invalid message');

    // validateSenderKey(connection, sender_verkey);

    if (message['status'] === "OK"){
        if(connection.state !== connectionsIndex.ConnectionState.Complete) {
            connection.state = connectionsIndex.ConnectionState.Complete;
            await indy.wallet.updateWalletRecordValue(
                indy.recordTypes.RecordType.Connection, 
                connection.connectionId, 
                JSON.stringify(connection)
            );
        }
    } else {
        throw new Error('Problem in acknowledge message');
    }

    return null;
};