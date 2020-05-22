'use strict';
const indy = require('../../../index.js');
const connectionsIndex = require('./index');
const generalTypes = require('../generalTypes');

exports.requestHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage

    // verify if did and did document are present and are valid
    validateConnectionField(message, sender_verkey);

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

    let connection = {};
    // This is intended to let the issuer use the same public did/verkey for 
    // all the connection. The main problem with this is the need of saving
    // the verkey of the other party as well.
    // if(invitation.public) {
    //     connection = await connectionsIndex.createPublicDidConnection(
    //         invitation.myDid,
    //         generalTypes.Initiator.Self,
    //         message['@id']
    //     );    
    // } else {
    //     connection = await connectionsIndex.createPeerDidConnection(
    //         generalTypes.Initiator.Self,
    //         message['@id']
    //     );
    // }
    
    // Just create a new did/verkey for each new connection
    connection = await connectionsIndex.createPeerDidConnection(
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

    console.log(connection)
    const originalMessage = await indy.crypto.verify(message, 'connection', connection.invitation.recipientKeys);

    // verify if did and did document are present and are valid
    validateConnectionField(originalMessage, sender_verkey);
    
    connection.theirDid = originalMessage.connection.did;
    // If it is a public did then it's in the blockchain and there's no need to save it in the wallet
    if(connection.theirDid.split(':')[1] === "peer") {
        await indy.didDoc.addLocalDidDocument(originalMessage.connection.did_doc);
    }
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


const validateConnectionField = (message, sender_verkey) => {
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
}