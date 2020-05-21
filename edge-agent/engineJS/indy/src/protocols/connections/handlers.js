'use strict';
const indy = require('../../../index.js');
const connectionsIndex = require('./index');
const generalTypes = require('../generalTypes');

exports.requestHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage

    if (!message.connection) 
        throw new Error('Invalid message');

    if(!message.connection.did) 
        throw new Error('No DID provided.')
    if(!message.connection.did_doc) 
        throw new Error('No DIDDoc provided.')
    if(message.connection.did != message.connection.did_doc.id) 
        throw new Error("Connection Did does not match DidDoc id.")
    
    const service = message.connection.did_doc.service[0]
    if (!service) 
        throw new Error('No communication service provided.');
    if (service.recipientKeys && service.recipientKeys.length == 0) 
        throw new Error('No service recipient keys provided.');
    // Check if sender verkey is in service recipient keys
    if (service.recipientKeys.indexOf(sender_verkey) == -1) 
        throw new Error('Sender verkey is not in the provided service recipient keys.');

    const invitations = await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.Invitation,
        {'myVerkey': recipient_verkey},
        {}
    );
    if(invitations.length < 1)
        throw new Error(`Invitation for verkey ${recipient_verkey} not found!`);
    const invitation = invitations[0]

    if(!invitation.multiUse && invitation.timesUsed > 0) {
        throw new Error('Invitation can only be used once!');
    }

    let connection = await connectionsIndex.createConnection(
        generalTypes.Initiator.Self,
        message['@id']
    );

    // Add did document to the wallet
    await indy.didDoc.addLocalDidDocument(message.connection.did_doc);
    
    // Add connection record
    connection.invitation = invitation;
    connection.theirDid = message.connection.did;
    connection.state = connectionsIndex.ConnectionState.Requested;
    await connectionsIndex.addConnection(
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

    let connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    const originalMessage = await indy.crypto.verify(message, 'connection', connection.invitation.recipientKeys);

    if(!originalMessage.connection.did) 
        throw new Error('No DID provided.')
    if(!originalMessage.connection.did_doc) 
        throw new Error('No DIDDoc provided.')
    if(originalMessage.connection.did != originalMessage.connection.did_doc.id) 
        throw new Error("Connection Did does not match DidDoc id.")
    const service = originalMessage.connection.did_doc.service[0]
    if (!service) 
        throw new Error('No communication service provided.');
    if (service.recipientKeys && service.recipientKeys.length == 0) 
        throw new Error('No service recipient keys provided.');
    // Check if sender verkey is in service recipient keys
    if (service.recipientKeys.indexOf(sender_verkey) == -1) 
        throw new Error('Sender verkey is not in the provided service recipient keys.');

    
    connection.theirDid = originalMessage.connection.did;
    await indy.didDoc.addLocalDidDocument(originalMessage.connection.did_doc);

    if(connection.state != connectionsIndex.ConnectionState.Requested){
        throw new Error(`Invalid state trasition.`)
    }

    if (!message['connection~sig'])
      throw new Error('Invalid message');


    // Update connection record
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

    let connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    if(connection.state != connectionsIndex.ConnectionState.Responded){
        throw new Error(`Invalid state trasition.`)
    }
    
    if (!message['status'])
        throw new Error('Invalid message');

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