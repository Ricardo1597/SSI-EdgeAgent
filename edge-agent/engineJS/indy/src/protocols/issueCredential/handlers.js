'use strict';
const indy = require('../../../index.js');
const generalTypes = require('../generalTypes');
const messages = require('./messages')
const credentialsIndex = require('./index')

exports.proposalHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage

    const connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    let credentialExchangeRecord = credentialsIndex.createCredentialExchangeRecord(
        connection.connectionId, 
        message,
        generalTypes.Initiator.External, 
        generalTypes.Roles.Issuer, 
        credentialsIndex.CredentialExchangeState.ProposalReceived
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

    return null;
};

exports.offerHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage;

    const connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    const credOffer = JSON.parse(Buffer.from(message['offers~attach'][0]['data']["base64"], 'base64').toString('ascii'));
    let credentialProposalMessage = null;
    if(message.credential_preview){
        credentialProposalMessage = messages.createCredentialProposal(
            message.comment,
            credOffer["schema_id"],
            message.credential_preview,
            credOffer["cred_def_id"],
            null,
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
        if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.ProposalSent) {
            throw new Error(`Invalid state trasition.`);
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
            credentialsIndex.CredentialExchangeState.OfferReceived
        );
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
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.CredentialExchange, 
            credentialExchangeRecord.credentialExchangeId, 
            JSON.stringify(credentialExchangeRecord), 
        );
    }

    let autoRequest = false // Change to allow user choice
    if(autoRequest)
        credentialsIndex.holderCreateAndSendRequest(credentialExchangeRecord);

    return null;
};

exports.requestHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage

    const connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);

    let credentialExchangeRecord = await credentialsIndex.searchCredentialExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );

    if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.OfferSent) {
        throw new Error(`Invalid state trasition.`);
    }

    const credRequest = JSON.parse(Buffer.from(message['requests~attach'][0]['data']["base64"], 'base64').toString('ascii'));

    // Update credential exchange record
    credentialExchangeRecord.credentialRequest = credRequest;
    credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.RequestReceived;

    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord), 
    );

    let autoResponse = false // Change to allow user choice
    if(autoResponse)
        credentialsIndex.issuerCreateAndSendCredential();
    
    return null;
};

exports.credentialHandler = async (decryptedMessage) => {
    console.log("cheguei 10")
    const {message, recipient_verkey, sender_verkey} = decryptedMessage

    const connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);
    
    let credentialExchangeRecord = await credentialsIndex.searchCredentialExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );

    if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.RequestSent) {
        throw new Error(`Invalid state trasition.`);
    }
        
    const rawCredential = JSON.parse(Buffer.from(message['credentials~attach'][0]['data']["base64"], 'base64').toString('ascii'));

    // Update credential exchange record
    const [credentialId, credential] = await credentialsIndex.storeCredential(
        credentialExchangeRecord, 
        null, 
        rawCredential
    );
    credentialExchangeRecord.credentialId = credentialId;
    credentialExchangeRecord.credential = credential;
    credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.CredentialReceived;
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord), 
    );

    await credentialsIndex.createAndSendAck(credentialExchangeRecord);

    return null;
};

exports.acknowledgeHandler = async (decryptedMessage) => {
    const {message, recipient_verkey, sender_verkey} = decryptedMessage

    if (!message['status'])
        throw new Error('Invalid message');

    const connection = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    await indy.connections.validateSenderKey(connection.theirDid, sender_verkey);
    
    let credentialExchangeRecord = await credentialsIndex.searchCredentialExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );

    if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.CredentialIssued) {
        throw new Error(`Invalid state trasition.`);
    }

    if (message['status'] === "OK"){
        if(credentialExchangeRecord.state !== credentialsIndex.CredentialExchangeState.Done) {
            // Update credential exchange record
            credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.Done;
            await indy.wallet.updateWalletRecordValue(
                indy.recordTypes.RecordType.CredentialExchange, 
                credentialExchangeRecord.credentialExchangeId, 
                JSON.stringify(credentialExchangeRecord), 
            );
        }
    } else {
        throw new Error('Problem in acknowledge message');
    }

    return null;
};