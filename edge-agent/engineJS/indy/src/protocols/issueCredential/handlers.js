'use strict';
const indy = require('../../../index.js');
const generalTypes = require('../generalTypes');
const messages = require('./messages')
const credentialsIndex = require('./index')

exports.proposalHandler = async (decryptedMessage) => {
    let {message, recipient_verkey, sender_verkey} = decryptedMessage

    let connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );
    if(connections.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);

    let connection = connections[0]

    let credentialExchangeRecord = credentialsIndex.createCredentialExchangeRecord(
        connection.connectionId, 
        message,
        generalTypes.Initiator.External, 
        generalTypes.Roles.Issuer, 
        credentialsIndex.CredentialExchangeState.ProposalReceived
    );

    await indy.wallet.addWalletRecord(
        indy.recordTypes.RecordType.CredentialExchange, 
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
    let {message, recipient_verkey, sender_verkey} = decryptedMessage;

    const connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    if(connections.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);
    let connection = connections[0]

    let credOffer = JSON.parse(Buffer.from(message['offers~attach'][0]['data']["base64"], 'base64').toString('ascii'));
    console.log(credOffer)
    console.log(credOffer["schema_id"])
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
    
    const credentialExchangeRecords = await credentialsIndex.searchCredentialExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );

    // Create or change credential exchange record                                                                    
    let credentialExchangeRecord = {}                                                                    
    if(credentialExchangeRecords.length > 0) {
        // Get credential exchange record (holder sent proposal first)
        credentialExchangeRecord = credentialExchangeRecords[0];
        if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.ProposalSent) {
            throw new Error(`Invalid state trasition.`);
        }
        console.log(credentialExchangeRecords);
        credentialExchangeRecord.credentialProposalDict = JSON.stringify(credentialProposalMessage);
        credentialExchangeRecord.state = credentialsIndex.CredentialExchangeState.OfferReceived;
    } else {
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
    console.log(credentialExchangeRecords);

    // Save credential exchange record in the wallet
    if(credentialExchangeRecord.initiator === "external") {
        // Issuer sent proposal first
        await indy.wallet.addWalletRecord(
            indy.recordTypes.RecordType.CredentialExchange, 
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
    let {message, recipient_verkey, sender_verkey} = decryptedMessage

    const connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    if(connections.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);
    let connection = connections[0]

    const credentialExchangeRecords = await credentialsIndex.searchCredentialExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );

    if(credentialExchangeRecords.length < 1)
        throw new Error(`credential exchange record for connection ${connection.connectionId} and thread ${message['~thread']['thid']} not found!`);
    let credentialExchangeRecord = credentialExchangeRecords[0]

    if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.OfferSent) {
        throw new Error(`Invalid state trasition.`);
    }

    let credRequest = JSON.parse(Buffer.from(message['requests~attach'][0]['data']["base64"], 'base64').toString('ascii'));

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
    let {message, recipient_verkey, sender_verkey} = decryptedMessage

    const connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    if(connections.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);
    let connection = connections[0]

    
    const credentialExchangeRecords = await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.CredentialExchange , 
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']},
        {}
    );
        
    if(credentialExchangeRecords.length < 1)
        throw new Error(`credential exchange record for connection ${connection.connectionId} and thread ${message['~thread']['thid']} not found!`);
    let credentialExchangeRecord = credentialExchangeRecords[0]

    if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.RequestSent) {
        throw new Error(`Invalid state trasition.`);
    }
        
    let rawCredential = JSON.parse(Buffer.from(message['credentials~attach'][0]['data']["base64"], 'base64').toString('ascii'));

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
    let {message, recipient_verkey, sender_verkey} = decryptedMessage

    if (!message['status'])
        throw new Error('Invalid message');

    const connections = await indy.connections.searchConnection(
        {'myVerkey': recipient_verkey}
    );

    if(connections.length < 1)
        throw new Error(`Connection for verkey ${recipient_verkey} not found!`);
    let connection = connections[0]

    
    const credentialExchangeRecords = await credentialsIndex.searchCredentialExchangeRecord(
        {'connectionId': connection.connectionId, 'threadId': message['~thread']['thid']}
    );
        
    if(credentialExchangeRecords.length < 1)
        throw new Error(`credential exchange record for connection ${connection.connectionId} and thread ${message['~thread']['thid']} not found!`);
    let credentialExchangeRecord = credentialExchangeRecords[0]

    if( credentialExchangeRecord.state != credentialsIndex.CredentialExchangeState.CredentialIssued) {
        throw new Error(`Invalid state trasition.`);
    }

    // validateSenderKey(connection, sender_verkey);

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