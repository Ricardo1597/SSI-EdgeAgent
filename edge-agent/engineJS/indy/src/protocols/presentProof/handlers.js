'use strict';
const indy = require('../../../index.js');
const generalTypes = require('../generalTypes');
const presentationsIndex = require('./index')

exports.proposalHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage
    const connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );   

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    let presentationExchangeRecord = presentationsIndex.createPresentationExchangeRecord(
        connection.connectionId, 
        message,
        generalTypes.Initiator.External, 
        generalTypes.Roles.Verifier, 
        presentationsIndex.PresentationExchangeState.ProposalReceived,
        message['@id']
    );
    
    await presentationsIndex.addPresentationExchangeRecord(
        presentationExchangeRecord.presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord), 
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );
        
    console.log("Presentation Exchange Id created in proposal handler: ", presentationExchangeRecord.presentationExchangeId)

    return null;
};


exports.requestHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage
    const connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    let presentationRequest = JSON.parse(Buffer.from(message['request_presentations~attach'][0]['data']["base64"], 'base64').toString('ascii'));

    let presentationExchangeRecord = {}
    try {
        presentationExchangeRecord = await presentationsIndex.searchPresentationExchangeRecord(
            {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );
        if(!presentationExchangeRecord) {
            throw new Error ('Record not found.')
        }
        if( presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.ProposalSent) {
            throw new Error(`Invalid state trasition.`);
        }
        presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.RequestReceived;
    } catch (error) {
        presentationExchangeRecord = presentationsIndex.createPresentationExchangeRecord(
            connection.connectionId,
            null,
            generalTypes.Initiator.External, 
            generalTypes.Roles.Prover, 
            presentationsIndex.PresentationExchangeState.RequestReceived,
            message['~thread']['thid']
        );
    }

    presentationExchangeRecord.presentationRequest = presentationRequest;

    // Save presentation exchange record in the wallet
    if(presentationExchangeRecord.initiator === "external") {
        // Verifier sent request first
        await presentationsIndex.addPresentationExchangeRecord(
            presentationExchangeRecord.presentationExchangeId, 
            JSON.stringify(presentationExchangeRecord), 
            {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );
        console.log("Presentation Exchange Id created in proposal handler: ", presentationExchangeRecord.presentationExchangeId)
    } else {
        // Holder sent proposal first
        presentationExchangeRecord.updatedAt = indy.utils.getCurrentDate();
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.PresentationExchange, 
            presentationExchangeRecord.presentationExchangeId, 
            JSON.stringify(presentationExchangeRecord), 
        );
    }

    return null;
};


exports.presentationHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage
    const connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    let presentationExchangeRecord = await presentationsIndex.searchPresentationExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );
    
    if( presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.RequestSent) {
        throw new Error(`Invalid state trasition.`);
    }

    let presentation = JSON.parse(Buffer.from(message['presentations~attach'][0]['data']["base64"], 'base64').toString('ascii'));

    // Update presentation exchange record
    presentationExchangeRecord.presentation = presentation;
    presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.PresentationReceived;
    presentationExchangeRecord.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.PresentationExchange, 
        presentationExchangeRecord.presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord)
    );

    return null;
};


exports.acknowledgeHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage

    if (!message['status']) {
        throw new Error('Invalid message');
    }
    const connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);
    
    let presentationExchangeRecord = await presentationsIndex.searchPresentationExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );

    if( presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.PresentationSent) {
        throw new Error(`Invalid state trasition.`);
    }

    if (message['status'] === "OK"){
        if(presentationExchangeRecord.state !== presentationsIndex.PresentationExchangeState.Done) {
            // Update presentation exchange record
            presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.Done;
            presentationExchangeRecord.updatedAt = indy.utils.getCurrentDate();
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


exports.problemReportHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage;
    
    if(!message.description || !message.description.code) {
        console.log("Received connection problem report without error code.")
        return;
    }

    const connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);
    
    let presentationExchangeRecord = await presentationsIndex.searchPresentationExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );
    switch(message.description.code) {
        case "proposal_not_accepted":
            if(presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.ProposalSent) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Presentation exchange proposal not accepted.");
            break;
        case "request_not_accepted":
            if(presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.RequestSent) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Presentation exchange request not accepted.");
            break;
        default:
            console.log(message.description);
    }

    presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.Error;
    presentationExchangeRecord.error = message.description;
    presentationExchangeRecord.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.PresentationExchange, 
        presentationExchangeRecord.presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord)
    );

    return null;
};