'use strict';
const indy = require('../../../index.js');
const generalTypes = require('../generalTypes');
const presentationsIndex = require('./index')

exports.proposalHandler = async (decryptedMessage) => {
    const { message, recipient_verkey, sender_verkey } = decryptedMessage;
    
    let connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );

    // If no connection was found, it is not possible to use Report Problem Protocol
    if(!connection) {
        throw new Error(`Connection for verkey ${recipient_verkey} not found.`);
    }

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    try {
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

    } catch(error){
        // problem report
        await sendHandlerProblemReport(
            connection,
            {
                code: "proposal_processing_error",
                description: error.externalMessage || "Internal server error."
            }
        );
        throw error;
    }

    return null;
};


exports.requestHandler = async (decryptedMessage) => {
    const { message, recipient_verkey, sender_verkey } = decryptedMessage;
    
    let connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );

    // If no connection was found, it is not possible to use Report Problem Protocol
    if(!connection) {
        throw new Error(`Connection for verkey ${recipient_verkey} not found.`);
    }

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    try {
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
                throw {
                    externalMessage: 'Unable to accept request at current state.',
                    internalMessage: `Invalid state transition.`
                };
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
            if(error.internalMessage === 'Invalid state transition.'){
                throw error
            }
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

    } catch(error){
        // problem report
        await sendHandlerProblemReport(
            connection,
            {
                code: "request_processing_error",
                description: error.externalMessage || "Internal server error."
            }
        );
        throw error;
    }

    return null;
};


exports.presentationHandler = async (decryptedMessage) => {
    const { message, recipient_verkey, sender_verkey } = decryptedMessage;
    
    let connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );

    // If no connection was found, it is not possible to use Report Problem Protocol
    if(!connection) {
        throw new Error(`Connection for verkey ${recipient_verkey} not found.`);
    }

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    try {
        let presentationExchangeRecord = await presentationsIndex.searchPresentationExchangeRecord(
            {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );
        
        if( presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.RequestSent) {
            throw {
                externalMessage: 'Unable to accept presentation at current state.',
                internalMessage: `Invalid state transition.`
            };
        }

        let presentation = JSON.parse(Buffer.from(message['presentations~attach'][0]['data']["base64"], 'base64').toString('ascii'));

        // Check if presentation is different from presentation proposal?

        // Update presentation exchange record
        presentationExchangeRecord.presentation = presentation;
        presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.PresentationReceived;
        presentationExchangeRecord.updatedAt = indy.utils.getCurrentDate();
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.PresentationExchange, 
            presentationExchangeRecord.presentationExchangeId, 
            JSON.stringify(presentationExchangeRecord)
        );

    } catch(error){
        // problem report
        await sendHandlerProblemReport(
            connection,
            {
                code: "presentation_processing_error",
                description: error.externalMessage || "Internal server error."
            }
        );
        throw error;
    }

    return null;
};


exports.acknowledgeHandler = async (decryptedMessage) => {
    const { message, recipient_verkey, sender_verkey } = decryptedMessage;
    
    let connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );

    // If no connection was found, it is not possible to use Report Problem Protocol
    if(!connection) {
        throw new Error(`Connection for verkey ${recipient_verkey} not found.`);
    }

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    try {
        let presentationExchangeRecord = await presentationsIndex.searchPresentationExchangeRecord(
            {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );

        if( presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.PresentationSent) {
            throw {
                externalMessage: 'Unable to accept ack at current state.',
                internalMessage: `Invalid state transition.`
            };
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
            throw {
                externalMessage: 'Invalid message. Wrong status.',
                internalMessage: 'Invalid message.'
            };
        }

    } catch(error){
        // problem report
        await sendHandlerProblemReport(
            connection,
            {
                code: "acknowledge_processing_error",
                description: error.externalMessage || "Internal server error."
            }
        );
        throw error;
    }

    return null;
};


exports.problemReportHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage;
    
    if(!message.description || !message.description.code) {
        console.log("Received connection problem report without error code.")
        return;
    }

    const connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);
    
    let presentationExchangeRecord = await presentationsIndex.searchPresentationExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );
    switch(message.description.code) {
        case "proposal_not_accepted":
        case "proposal_processing_error":
            if(presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.ProposalSent) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Presentation exchange proposal not accepted.");
            presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.Init;
            break;
        case "request_not_accepted":
        case "request_processing_error":
            if(presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.RequestSent) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Presentation exchange request not accepted.");
            if(presentationExchangeRecord.initiator === "self"){
                presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.Init;
            } else {
                presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.ProposalReceived;
            }
            break;
        case "presentation_processing_error":
            if(presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.PresentationSent) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Presentation exchange presentation not accepted.");
            presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.RequestReceived;
            break;
        case "acknowledge_processing_error":
            if(presentationExchangeRecord.state != presentationsIndex.PresentationExchangeState.Done) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Presentation exchange ack not accepted.");
            presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.PresentationVerified;
            break;
        case "presentation-abandoned":
            console.log("Credential presentation abandoned.");
            presentationExchangeRecord.state = presentationsIndex.PresentationExchangeState.Error;
            presentationExchangeRecord.error = {
                self: false,
                description: message.description
            };
            break;
        default:
            console.log(message.description);
    }

    // update record (for now just return to previous state or error state)
    presentationExchangeRecord.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.PresentationExchange, 
        presentationExchangeRecord.presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord)
    );

    return null;
};


const sendHandlerProblemReport = async (record, error) => {
    await indy.problemReport.sendProblemReport(
        record,
        record.connectionId,
        error,
        "message",
        presentationsIndex.MessageType.ProblemReport,
        indy.recordTypes.RecordType.PresentationExchange
    );
}