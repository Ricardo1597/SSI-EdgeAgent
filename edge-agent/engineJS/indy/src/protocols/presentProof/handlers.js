'use strict';
const indy = require('../../../index.js');
const generalTypes = require('../generalTypes');
const messages = require('./messages')
const presentationsIndex = require('./index')

exports.proposalHandler = async (decryptedMessage) => {
    console.log("Cheguei 6")
    let {message, recipient_verkey, sender_verkey} = decryptedMessage
    let connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );
    if(connections.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);

    let connection = connections[0]

    let presentationExchangeRecord = presentationsIndex.createPresentationExchangeRecord(
        connection.connectionId, 
        message,
        generalTypes.Initiator.External, 
        generalTypes.Roles.Verifier, 
        presentationsIndex.PresentationExchangeState.ProposalReceived
    );
    
    await indy.wallet.addWalletRecord(
        indy.recordTypes.RecordType.PresentationExchange, 
        presentationExchangeRecord.presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord), 
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );
        
    console.log("Presentation Exchange Id created in proposal handler: ", presentationExchangeRecord.presentationExchangeId)

    return null;
};


exports.requestHandler = async (decryptedMessage) => {
    let {message, recipient_verkey, sender_verkey} = decryptedMessage
    let connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );
    if(connections.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);

    let connection = connections[0]

    let presentationRequest = JSON.parse(Buffer.from(message['request_presentations~attach'][0]['data']["base64"], 'base64').toString('ascii'));

    const presentationExchangeRecords = await presentationsIndex.searchPresentationExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );

    let presentationExchangeRecord = {}
    if(presentationExchangeRecords.length > 0) {
        presentationExchangeRecord = presentationExchangeRecords[0]
        if( presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.ProposalSent) {
            throw new Error(`Invalid state trasition.`);
        }
        presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.RequestReceived;
    } else {
        presentationExchangeRecord = presentationsIndex.createPresentationExchangeRecord(
            connection.connectionId,
            message,
            generalTypes.Initiator.External, 
            generalTypes.Roles.Prover, 
            presentationsIndex.PresentationExchangeState.RequestReceived
        );
    }

    presentationExchangeRecord.presentationRequest = presentationRequest;

    // Save credential exchange record in the wallet
    if(presentationExchangeRecord.initiator === "external") {
        // Verifier sent request first
        await indy.wallet.addWalletRecord(
            indy.recordTypes.RecordType.PresentationExchange, 
            presentationExchangeRecord.presentationExchangeId, 
            JSON.stringify(presentationExchangeRecord), 
            {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );
        console.log("Presentation Exchange Id created in proposal handler: ", presentationExchangeRecord.presentationExchangeId)
    } else {
        // Holder sent proposal first
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.PresentationExchange, 
            presentationExchangeRecord.presentationExchangeId, 
            JSON.stringify(presentationExchangeRecord), 
        );
    }

    return null;
};


exports.presentationHandler = async (decryptedMessage) => {
    console.log("Cheguei 8")
    let {message, recipient_verkey, sender_verkey} = decryptedMessage
    let connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );
    if(connections.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);

    let connection = connections[0]

    const presentationExchangeRecords = await presentationsIndex.searchPresentationExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );

    if(presentationExchangeRecords.length < 1)
        throw new Error(`Presentation exchange record for connection ${connection.connectionId} and thread ${message['~thread']['thid']} not found!`);
    let presentationExchangeRecord = presentationExchangeRecords[0]
    
    if( presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.RequestSent) {
        throw new Error(`Invalid state trasition.`);
    }

    let presentation = JSON.parse(Buffer.from(message['presentations~attach'][0]['data']["base64"], 'base64').toString('ascii'));

    // Update presentation exchange record
    presentationExchangeRecord.presentation = presentation;
    presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.PresentationReceived;

    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.PresentationExchange, 
        presentationExchangeRecord.presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord)
    );

    return null;
};


exports.acknowledgeHandler = async (decryptedMessage) => {
    let {message, recipient_verkey, sender_verkey} = decryptedMessage

    if (!message['status']) {
        throw new Error('Invalid message');
    }
    let connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    if(connections.length < 1) {
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);
    }

    let connection = connections[0]
    
    const presentationExchangeRecords = await presentationsIndex.searchPresentationExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );
        
    if(presentationExchangeRecords.length < 1)
        throw new Error(`presentation exchange record for connection ${connection.connectionId} and thread ${message['~thread']['thid']} not found!`);
    let presentationExchangeRecord = presentationExchangeRecords[0]

    if( presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.PresentationSent) {
        throw new Error(`Invalid state trasition.`);
    }

    // validateSenderKey(connection, sender_verkey);

    if (message['status'] === "OK"){
        if(presentationExchangeRecord.state !== presentationsIndex.PresentationExchangeState.Done) {
            // Update presentation exchange record
            presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.Done;
            await indy.wallet.updateWalletRecordValue(
                indy.recordTypes.RecordType.PresentationExchange, 
                presentationExchangeRecord.presentationExchangeId, 
                JSON.stringify(presentationExchangeRecord)
            );
        }
    } else {
        throw new Error('Problem in acknowledge message');
    }

    return null;
};