'use strict';
const indy = require('../../../index.js');
const uuid = require('uuid');
const sdk = require('indy-sdk');
const messages = require('./messages')
const generalTypes = require('../generalTypes')
const sha256 = require('js-sha256').sha256;

exports.handlers = require('./handlers');

const CredentialExchangeState = {
    Init: "init",
    ProposalSent: "proposal_sent",
    ProposalReceived: "proposal_received",
    OfferSent: "offer_sent",
    OfferReceived: "offer_received",
    RequestSent: "request_sent",
    RequestReceived: "request_received",
    CredentialIssued: "credential_issued",
    CredentialReceived: "credential_received",
    Done: "done",
    Error: "error"
}
exports.CredentialExchangeState = CredentialExchangeState;

exports.RejectionErrors = {
    Proposal: {
        state: CredentialExchangeState.ProposalReceived,
        code: "proposal_not_accepted",
        description: "Credential proposal rejected."
    },
    Offer: {
        state: CredentialExchangeState.OfferReceived,
        code: "offer_not_accepted",
        description: "Credential offer rejected."
    },
    Request: {
        state: CredentialExchangeState.RequestReceived,
        code: "request_not_accepted",
        description: "Credential request rejected."
    },
}

exports.MessageType = messages.MessageType;
exports.NewMessageType = messages.NewMessageType;


// Use in CredentialExchangeRecord has tags to help in search
// They are stored in "JSON.parse(credentialExchangeRecord.credentialProposalDict)"
const CredDefTags = [
    "schema_id",
    "schema_issuer_did",
    "schema_name",
    "schema_version",
    "issuer_did",
    "cred_def_id",
]


// Holder starts exchange at credential proposal
exports.holderCreateAndSendProposal = async (connectionId, comment, attributes, schemaId, credDefId) => {
    // Get connection to send message (credential proposal)
    const connection = await indy.connections.getConnection(connectionId);

    const credentialPreview = messages.createCredentialPreview(attributes);
    
    const credentialProposalMessage = messages.createCredentialProposal(
        comment, 
        schemaId, 
        credentialPreview, 
        credDefId, 
        null
    );

    let credentialExchangeRecord = this.createCredentialExchangeRecord(
        connectionId, 
        credentialProposalMessage, 
        generalTypes.Initiator.Self, 
        generalTypes.Roles.Holder, 
        CredentialExchangeState.Init,
        credentialProposalMessage['@id']
    );
    
    const [message, endpoint] = await indy.messages.prepareMessage(credentialProposalMessage, connection);
    indy.messages.sendMessage(message, endpoint);

    // Add credential exchange record to the wallet
    credentialExchangeRecord.state = CredentialExchangeState.ProposalSent
    await this.addCredentialExchangeRecord(
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord), 
        {'connectionId': connection.connectionId, 'threadId': credentialProposalMessage['~thread']['thid']}
    );

    return [credentialExchangeRecord, credentialProposalMessage];
}


// Issuer starts exchange at credential offer (jumpping credential proposal phase)
exports.exchangeStartAtOffer = async (connectionId, comment, attributes, credDefId) => {
    const credentialPreview = messages.createCredentialPreview(attributes);

    // Is there a way to get the schemaId from the credDefId?

    const credentialProposalMessage = messages.createCredentialProposal(
        comment, 
        null, 
        credentialPreview, 
        credDefId, 
        null
    );

    let credentialExchangeRecord = this.createCredentialExchangeRecord(
        connectionId, 
        credentialProposalMessage, 
        generalTypes.Initiator.Self, 
        generalTypes.Roles.Issuer, 
        CredentialExchangeState.Init,
        credentialProposalMessage['@id']
    );

    await this.addCredentialExchangeRecord(
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord),
        {'connectionId': connectionId, 'threadId': credentialProposalMessage['~thread']['thid']}
    );
                                      
    return await exports.issuerCreateAndSendOffer(credentialExchangeRecord, comment)
}


exports.issuerCreateAndSendOffer = async (credentialExchangeRecord, comment) => {
    const state = credentialExchangeRecord.state
    if( state != CredentialExchangeState.Init && state != CredentialExchangeState.ProposalReceived) {
        throw new Error(`Invalid state trasition.`);
    }

    // Get connection to send message (credential offer)
    const connection = await indy.connections.getConnection(credentialExchangeRecord.connectionId);

    // Get credential preview and credential definition id from record
    const credentialProposalMessage = JSON.parse(credentialExchangeRecord.credentialProposalDict);
    const credentialPreview = credentialProposalMessage.credential_proposal;
    const credDefId = credentialProposalMessage.cred_def_id;

    // Calculate "data"
    const credentialOffer = await indy.issuer.createCredentialOffer(credDefId);
    const data = Buffer.from(JSON.stringify(credentialOffer)).toString("base64");

    let credentialOfferMessage = messages.createCredentialOffer(
        comment, 
        credentialPreview, 
        data, 
        credentialExchangeRecord.threadId
    );

    // Create and send credential offer message to a given endpoint
    const [message, endpoint] = await indy.messages.prepareMessage(credentialOfferMessage, connection);
    indy.messages.sendMessage(message, endpoint);

    // Update credential exchange record
    if(!credentialExchangeRecord.threadId) 
        credentialExchangeRecord.threadId = credentialOfferMessage['~thread']['thid'];
    credentialExchangeRecord.schemaId = credentialOffer["schema_id"];
    credentialExchangeRecord.credentialDefinitionId = credentialOffer["cred_def_id"];
    credentialExchangeRecord.state = CredentialExchangeState.OfferSent;
    credentialExchangeRecord.credentialOffer = credentialOffer;
    credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord)
    );

    return [credentialExchangeRecord, credentialOfferMessage];
}


exports.holderCreateAndSendRequest = async (credentialExchangeRecord) => {
    if( credentialExchangeRecord.state != CredentialExchangeState.OfferReceived) {
        throw new Error(`Invalid state trasition.`);
    }

    // Get connection to send message (credential request)
    const connection = await indy.connections.getConnection(credentialExchangeRecord.connectionId);
    
    // if(credentialExchangeRecord.credentialRequest)
    //     throw new Error(`Create request called multiple times for credential exchange ${credentialExchangeRecord.credentialExchangeId}`);

    // Calculate credential request "data" 
    const [,credDef] = await indy.ledger.getCredDef(null, credentialExchangeRecord.credentialDefinitionId);
    const credOffer = credentialExchangeRecord.credentialOffer;
    if(!credOffer['nonce'])
        throw new Error('Missing nonce in credential offer');

    const [credentialRequest, credentialRequestMetadata] = await indy.holder.createCredentialRequest(
        connection.myDid, 
        credOffer, 
        credDef
    );
    const data = Buffer.from(JSON.stringify(credentialRequest)).toString("base64");

    let credentialRequestMessage = messages.createCredentialRequest(
        data, 
        credentialExchangeRecord.threadId
    );

    // Create and send credential request message to a given endpoint
    const [message, endpoint] = await indy.messages.prepareMessage(credentialRequestMessage, connection);
    indy.messages.sendMessage(message, endpoint);

    // Update credential exchange record
    credentialExchangeRecord.credentialRequest = credentialRequest;
    credentialExchangeRecord.credentialRequestMetadata = credentialRequestMetadata;
    credentialExchangeRecord.state = CredentialExchangeState.RequestSent;
    credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord)
    );

    return [credentialExchangeRecord, credentialRequestMessage];
}


exports.issuerCreateAndSendCredential = async (credentialExchangeRecord, comment, credentialValues) => {
    if( credentialExchangeRecord.state != CredentialExchangeState.RequestReceived) {
        throw new Error(`Invalid state trasition.`);
    }
    // Get connection to send message (credential)
    const connection = await indy.connections.getConnection(credentialExchangeRecord.connectionId);
    
    // Calculate credential request "data"   
    const [,schema] = await indy.ledger.getSchema(null, credentialExchangeRecord.schemaId);
    // If no credential values were passed, used the credential_proposal ones
    if(!credentialValues) {
        const credentialProposal = JSON.parse(credentialExchangeRecord.credentialProposalDict)
        credentialValues = credentialProposal['credential_proposal']['attributes'];
    }
    const encodedValues = createEncodedCredentialValues(credentialValues, schema['attrNames']);
    const credentialOffer = credentialExchangeRecord.credentialOffer;
    const credentialRequest = credentialExchangeRecord.credentialRequest;

    // Get credential definition id from record and check for revocation registry
    const credDefId = JSON.parse(credentialExchangeRecord.credentialProposalDict).cred_def_id;
    const [,credDef] = await indy.ledger.getCredDef(null, credDefId)
    let tailsReaderHandler = -1;
    if(credDef["value"]["revocation"]){
        console.log("This credential support revocation.")
        // Find a active revocation registry record by credDefId
        const revocRegRecord = await indy.revocation.searchRevocRegRecord({'credDefId': credDefId});

        if(!revocRegRecord) {
            throw new Error(` Credential definition id ${credDefId} has no active revocation registry.`);
        }

        credentialExchangeRecord.revocRegId = revocRegRecord.revocRegId;
        if(revocRegRecord.tailsLocalPath) {
            tailsReaderHandler = await indy.blobStorage.createTailsReader(revocRegRecord.tailsLocalPath)
        }
    }
    
    const [credential,revocationId,] = await indy.issuer.createCredential(
        credentialOffer, 
        credentialRequest, 
        encodedValues, 
        credentialExchangeRecord.revocRegId, // null if not set
        tailsReaderHandler
    );

    const data = Buffer.from(JSON.stringify(credential)).toString("base64");

    let credentialIssuedMessage = messages.createCredentialResponse(
        data, 
        credentialExchangeRecord.threadId
    );

    // Create and send credential message to a given endpoint
    const [message, endpoint] = await indy.messages.prepareMessage(credentialIssuedMessage, connection);
    indy.messages.sendMessage(message, endpoint);
    
    // Update credential exchange record
    credentialExchangeRecord.credential = credential;
    credentialExchangeRecord.revocationId = revocationId;
    credentialExchangeRecord.state = CredentialExchangeState.CredentialIssued;
    credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord)
    );

    return [credentialExchangeRecord, credentialIssuedMessage];
}

// Store credential in the wallet
exports.storeCredential = async (credentialExchangeRecord, credentialId, rawCredential) => {
    let revocRegDef = null;
    const [,credDef] = await indy.ledger.getCredDef(null, rawCredential["cred_def_id"]);
    if (rawCredential["rev_reg_id"]) {
        [,revocRegDef] = await indy.ledger.getRevocRegDef(null, rawCredential["rev_reg_id"]);
    }
    // check if revocReg has local tails file? For now assume it does
    try {
        credentialId = await indy.holder.storeCredential(
            credentialId,
            credentialExchangeRecord.credentialRequestMetadata,
            rawCredential,
            credDef,
            revocRegDef
        );
    } catch(e) {
        console.log(`Error storing credential. ${e.error_code}: ${e.message}`);
        throw new Error(e);
    }

    const credential = await indy.holder.getCredential(credentialId);

    // Update credential exchange record
    credentialExchangeRecord.credential = credential;
    credentialExchangeRecord.revocRegId = credential['rev_reg_id'];
    credentialExchangeRecord.revocationId = credential['cred_rev_id'];
    credentialExchangeRecord.state = CredentialExchangeState.CredentialIssued;
    credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord)
    );

    return [credentialId, credential];
}


exports.createAndSendAck = async (credentialExchangeRecord) => {
    if( credentialExchangeRecord.state != CredentialExchangeState.CredentialReceived) {
        throw new Error(`Invalid state trasition.`);
    }

    // Get connection to send message (ack)
    const connection = await indy.connections.getConnection(credentialExchangeRecord.connectionId);

    const credentialAckMessage = messages.createCredentialAckMessage(credentialExchangeRecord.threadId);

    // Create and send ack message to a given endpoint
    const [message, endpoint] = await indy.messages.prepareMessage(credentialAckMessage, connection);
    indy.messages.sendMessage(message, endpoint);

    // Update credential exchange record
    credentialExchangeRecord.state = CredentialExchangeState.Done;
    credentialExchangeRecord.updatedAt = indy.utils.getCurrentDate();
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord)
    );

    return [credentialExchangeRecord, credentialAckMessage];
}

// Issuer revokes a credential
exports.revokeCredential = async (revocRegId, credRevId, publish) => {
    // Get revocation registry record
    let revocRegRecord = await indy.revocation.searchRevocRegRecord({'revocRegId': revocRegId});
    if(!revocRegRecord){
        throw new Error(`No revocation registry record found for id ${revocRegId}`)
    }
    if(publish) {
        // Create entry and send it to the ledger
        const [delta, invalidCredRevIds] = await indy.wallet.issuerRevokeCredentials(
            revocRegRecord.tailsLocalPath, 
            revocRegId, 
            [credRevId]
        );

        if(delta) {
            // Update revocation registry entry with new delta
            revocRegRecord.revocRegEntry = delta;
            await indy.wallet.updateWalletRecordValue(
                indy.recordTypes.RecordType.RevocationRegistry, 
                revocRegRecord.recordId, 
                JSON.stringify(revocRegRecord)
            );
            await indy.revocation.publishRevocRegEntry(revocRegRecord.revocRegId)
        }

        return invalidCredRevIds
    } else {
        await indy.revocation.markRevocationAsPending(revocRegRecord.recordId, credRevId);
        return null;
    }
}

// Issuer publishs pending revocations
exports.publishPendingRevocations = async (revocRegId=null) => {
    let tags = {
        'hasPendingRevocations': 'true'
    }
    if(revocRegId) tags['revocRegId'] = revocRegId;

    // Get registry record if it has pending revocations
    let revocRegRecords = await indy.revocation.searchRevocRegRecord(
        tags,
        true
    );
    if(revocRegRecords.length === 0){
        console.log('No records with pending revocations found.')
    }

    let result = {};
    let invalidCredRevIds = {}

    for(let record of revocRegRecords) {
        let indexesToRevoke = record.pendingPub;
        if(indexesToRevoke.length > 0) {
            const [delta, invalidIds] = await indy.wallet.issuerRevokeCredentials(
                record.tailsLocalPath,
                record.revocRegId,
                indexesToRevoke
            );
            // Update revocation registry entry with new delta
            record.revocRegEntry = delta;
            await indy.wallet.updateWalletRecordValue(
                indy.recordTypes.RecordType.RevocationRegistry,
                record.recordId,
                JSON.stringify(record)
            );
            // Publish to the ledger
            await indy.revocation.publishRevocRegEntry(record.revocRegId);

            result[record.revocRegId] = indexesToRevoke;
            if(invalidIds.length > 0){
                invalidCredRevIds[record.revocRegId] = invalidIds;
            }

            // Clear pending revocations from the record
            await indy.revocation.clearPendingRevocations(record.recordId);
        }
    }

    return [result, invalidCredRevIds];
}

exports.createCredentialExchangeRecord = (connectionId, message, initiator, role, state, threadId) => {
    const currentDate = indy.utils.getCurrentDate();

    return {
        credentialExchangeId: uuid(),
        connectionId: connectionId,
        threadId: threadId, 
        initiator: initiator,
        role: role,
        state: state,
        credentialProposalDict: JSON.stringify(message),
        createdAt: currentDate,
        updatedAt: currentDate,
  }
}


// Using problem report protocol for hadling rejections
exports.rejectExchange = async (credentialExchangeRecord, rejectError) => {
    return await indy.problemReport.rejectExchange(
        credentialExchangeRecord,
        credentialExchangeRecord.credentialExchangeId,
        rejectError,
        this.MessageType.ProblemReport,
        indy.recordTypes.RecordType.CredentialExchange,
        CredentialExchangeState.Error
    );
}


exports.getCredentialExchangeRecord = async (id) => {
    try {
        return await indy.wallet.getWalletRecord(
            indy.recordTypes.RecordType.CredentialExchange, 
            id, 
            {}
        );
    } catch(error) {
        if(error.indyCode && error.indyCode === 212){
            console.log("Unable to get credential exchange record. Wallet item not found.");
        }
        return null;
    }
}

exports.searchCredentialExchangeRecord = async (query) => {
    const records = await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.CredentialExchange,
        query, 
        {}
    );
        
    if(records.length < 1){
        console.log("Unable to get credential exchange record. Wallet item not found.");
        return null;
    }

    return records[0];
}

exports.getAllCredentialExchangeRecords = async () => {
    return await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.CredentialExchange, 
        {}, 
        {}
    );
}

exports.addCredentialExchangeRecord = async (id, value, tags={}) => {
    try {
        return await indy.wallet.addWalletRecord(
            indy.recordTypes.RecordType.CredentialExchange,
            id,
            value,
            tags
        );
    } catch(error) {
        if(error.indyCode && error.indyCode === 213){
            console.log("Unable to add credential exchange record. Wallet item already exists.");
        }
        //throw error;
    }
}

exports.removeCredentialExchangeRecord = async (id) => {    
    // Get credential exchange record
    const record = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.CredentialExchange, 
      id, 
      {}
    );

    // Get connection to send message (exchange termination)
    const connection = await indy.connections.getConnection(record.connectionId);

    const rejectMessage = indy.problemReport.messages.createProblemeReportMessage(
        indy.credentialExchange.MessageType.ProblemReport,
        "issuance-abandoned",
        "Credential issuance abandoned.",
        "thread",
        record.threadId
    );

    const [message, endpoint] = await indy.messages.prepareMessage(
        rejectMessage, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);

    await indy.wallet.deleteWalletRecord(
        indy.recordTypes.RecordType.CredentialExchange, 
        id
    );
}

exports.encode = (orig) => {
	// Booleans
	if(typeof(orig) === "boolean"){
		return orig ? "1" : "0";
    }
    // Convert null values to "None"
	if(orig == null) orig = "None"
	// Integers and integer strings (1234, "5678", etc)
    let i32orig = (orig === + orig) ? + orig : orig
    if(i32orig.toString().indexOf('.') === -1 && i32orig !== "" && i32orig >= -(2 ** 31) && i32orig < (2 ** 31)){
        return i32orig.toString()
    }
    // All the rest
	return BigInt('0x' + sha256(i32orig.toString())).toString()
}


const createEncodedCredentialValues = (credentialValues, schemaAttributes) => {
    let encodedValues = {};
    credentialValues.forEach(attribute => {
        if(!schemaAttributes.includes(attribute['name'])){
            throw new Error(`Provided credential values are missing the value for the schema attribute ${attribute['name']}`);
        }
        encodedValues[attribute['name']] = {
            'raw': attribute['value'] ? attribute['value'].toString() : null,
            'encoded': this.encode(attribute['value'])
        }
    });

    return encodedValues;
}