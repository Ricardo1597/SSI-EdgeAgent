'use strict';
const indy = require('../../../index.js');
const generalTypes = require('../generalTypes');
const messages = require('./messages')
const credentialsIndex = require('./index')

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
        let credentialExchangeRecord = credentialsIndex.createCredentialExchangeRecord(
            connection.connectionId, 
            message,
            generalTypes.Initiator.External, 
            generalTypes.Roles.Issuer, 
            credentialsIndex.CredentialExchangeState.ProposalReceived,
            message['@id']
        );

        await credentialsIndex.addCredentialExchangeRecord(
            credentialExchangeRecord.credentialExchangeId, 
            JSON.stringify(credentialExchangeRecord), 
            {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );
        
        console.log(
            "Credential Exchange Id created in proposal handler: ", 
            credentialExchangeRecord.credentialExchangeId
        );
        
        let auto_offer = false // Change to allow user choice
        if(auto_offer)
            credentialsIndex.issuerCreateAndSendOffer(credentialExchangeRecord, null);

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

exports.offerHandler = async (decryptedMessage) => {
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
        const credOffer = JSON.parse(Buffer.from(message['offers~attach'][0]['data']["base64"], 'base64').toString('ascii'));
        let credentialProposalMessage = null;
        if(message.credential_preview){
            credentialProposalMessage = messages.createCredentialProposal(
                message.comment,
                credOffer["schema_id"],
                message.credential_preview,
                credOffer["cred_def_id"],
                message['~thread']['thid']
            );
        } 

        // Create or change credential exchange record                                                                    
        let credentialExchangeRecord = {}   
        try {
            // Get credential exchange record (holder sent proposal first)
            credentialExchangeRecord = await credentialsIndex.searchCredentialExchangeRecord(
                {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
            );
            if(!credentialExchangeRecord) {
                throw new Error ('Record not found.')
            }
            if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.ProposalSent) {
                throw {
                    externalMessage: 'Unable to accept offer at current state.',
                    internalMessage: `Invalid state transition.`
                };
            }
            credentialExchangeRecord.credentialProposalDict = JSON.stringify(credentialProposalMessage);
            credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.OfferReceived;
        } catch(error) {
            // Create credential exchange record (issuer sent proposal first)
            credentialExchangeRecord = credentialsIndex.createCredentialExchangeRecord(
                connection.connectionId, 
                credentialProposalMessage,
                generalTypes.Initiator.External, 
                generalTypes.Roles.Holder, 
                credentialsIndex.CredentialExchangeState.OfferReceived,
                message['~thread']['thid']
            );
            if(error.internalMessage === 'Invalid state transition.'){
                throw error
            }
        };
        credentialExchangeRecord.credentialOffer = credOffer;
        credentialExchangeRecord.schemaId = credOffer["schema_id"];
        credentialExchangeRecord.credentialDefinitionId = credOffer["cred_def_id"];

        // Save credential exchange record in the wallet
        if(credentialExchangeRecord.initiator === "external") {
            // Issuer sent proposal first
            await credentialsIndex.addCredentialExchangeRecord(
                credentialExchangeRecord.credentialExchangeId, 
                JSON.stringify(credentialExchangeRecord), 
                {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
            );
        } else {
            // Holder sent proposal first
            credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
            await indy.wallet.updateWalletRecordValue(
                indy.recordTypes.RecordType.CredentialExchange, 
                credentialExchangeRecord.credentialExchangeId, 
                JSON.stringify(credentialExchangeRecord), 
            );
        }

        let autoRequest = false // Change to allow user choice
        if(autoRequest)
            credentialsIndex.holderCreateAndSendRequest(credentialExchangeRecord);

    } catch(error){
        // problem report
        await sendHandlerProblemReport(
            connection,
            {
                code: "offer_processing_error",
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
        let credentialExchangeRecord = await credentialsIndex.searchCredentialExchangeRecord(
            {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );

        if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.OfferSent) {
            throw {
                externalMessage: 'Unable to accept request at current state.',
                internalMessage: `Invalid state transition.`
            };
        }

        const credRequest = JSON.parse(Buffer.from(message['requests~attach'][0]['data']["base64"], 'base64').toString('ascii'));

        // Update credential exchange record
        credentialExchangeRecord.credentialRequest = credRequest;
        credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.RequestReceived;
        credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.CredentialExchange, 
            credentialExchangeRecord.credentialExchangeId, 
            JSON.stringify(credentialExchangeRecord), 
        );

        let autoResponse = false // Change to allow user choice
        if(autoResponse)
            credentialsIndex.issuerCreateAndSendCredential();

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

exports.credentialHandler = async (decryptedMessage) => {
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
        let credentialExchangeRecord = await credentialsIndex.searchCredentialExchangeRecord(
            {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );

        if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.RequestSent) {
            throw {
                externalMessage: 'Unable to accept credential at current state.',
                internalMessage: `Invalid state transition.`
            };
        }
        const rawCredential = JSON.parse(Buffer.from(message['credentials~attach'][0]['data']["base64"], 'base64').toString('ascii'));
        console.log(rawCredential)

        // Update credential exchange record
        const [credentialId, credential] = await credentialsIndex.storeCredential(
            credentialExchangeRecord, 
            null, 
            rawCredential
        );

        credentialExchangeRecord.credentialId = credentialId;
        credentialExchangeRecord.credential = credential;
        credentialExchangeRecord.revocRegId = credential['rev_reg_id'];
        credentialExchangeRecord.revocationId = credential['cred_rev_id'];
        credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.CredentialReceived;
        credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.CredentialExchange, 
            credentialExchangeRecord.credentialExchangeId, 
            JSON.stringify(credentialExchangeRecord), 
        );

        await credentialsIndex.createAndSendAck(credentialExchangeRecord);

    } catch(error){
        // problem report
        await sendHandlerProblemReport(
            connection,
            {
                code: "credential_processing_error",
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
        let credentialExchangeRecord = await credentialsIndex.searchCredentialExchangeRecord(
            {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
        );

        if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.CredentialIssued) {
            throw {
                externalMessage: 'Unable to accept ack at current state.',
                internalMessage: `Invalid state transition.`
            };
        }

        if (message['status'] === "OK"){
            if(credentialExchangeRecord.state !== credentialsIndex.CredentialExchangeState.Done) {
                // Update credential exchange record
                credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.Done;
                credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
                await indy.wallet.updateWalletRecordValue(
                    indy.recordTypes.RecordType.CredentialExchange, 
                    credentialExchangeRecord.credentialExchangeId, 
                    JSON.stringify(credentialExchangeRecord), 
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

exports.revocationHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage

    const connection = await indy.connections.searchConnections(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);
    
    let credentialExchangeRecord = await credentialsIndex.searchCredentialExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );

    if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.Done) {
        throw new Error(`Invalid state.`);
    }

    credentialExchangeRecord.isCredentialRevoked = true;
    credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord), 
    );

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
    
    let credentialExchangeRecord = await credentialsIndex.searchCredentialExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );
    switch(message.description.code) {
        case "proposal_not_accepted":
        case "proposal_processing_error":
            if(credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.ProposalSent) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Credential exchange proposal not accepted.");
            credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.Init;
            break;
        case "offer_not_accepted":
        case "offer_processing_error":
            if(credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.OfferSent) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Credential exchange offer not accepted.");
            if(credentialExchangeRecord.initiator === "self"){
                credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.Init;
            } else {
                credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.ProposalReceived;
            }
            break;
        case "request_not_accepted":
        case "request_processing_error":
            if(credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.RequestSent) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Credential exchange request not accepted.");
            credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.OfferReceived;
            break;
        case "presentation_processing_error":
            if(credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.CredentialIssued) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Credential exchange credential not accepted.");
            credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.RequestReceived;
            break;
        case "acknowledge_processing_error":
            if(credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.Done) {
                console.log(`Invalid state transition `);
                return;
            }
            console.log("Credential exchange ack not accepted.");
            credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.CredentialReceived;
            break;
        case "issuance-abandoned":
            console.log("Credential issuance abandoned.");
            credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.Error;
            credentialExchangeRecord.error = {
                self: false,
                description: message.description
            };
            break;
        default:
            console.log(message.description);
    }

    // Update record (for now just return to previous state or error state)
    credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord)
    );
    
    return null;
};


const sendHandlerProblemReport = async (record, error) => {
    await indy.problemReport.sendProblemReport(
        record,
        record.connectionId,
        error,
        "message",
        credentialsIndex.MessageType.ProblemReport,
        indy.recordTypes.RecordType.CredentialExchange
    );
}