'use strict';
const indy = require('../../../index.js');
const uuid = require('uuid');
const messages = require('./messages')
const generalTypes = require('../generalTypes')
const sha256 = require('js-sha256').sha256;

exports.handlers = require('./handlers');


// RECORD_TYPE = "credential_exchange_v10"
// RECORD_ID_NAME = "credential_exchange_id"
// TAG_NAMES = {"thread_id"}

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
}

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


exports.CredentialExchangeState = CredentialExchangeState;
  

exports.MessageType = messages.MessageType;

// Holder starts exchange at credential proposal
exports.holderCreateAndSendProposal = async (connectionId, comment, attributes, schemaId, credDefId, issuerDid) => {
    // Get connection to send message (credential proposal)
    const connection = await indy.connections.getConnection(connectionId);

    const credentialPreview = messages.createCredentialPreview(attributes);
    
    const credentialProposalMessage = messages.createCredentialProposal(
        comment, 
        schemaId, 
        credentialPreview, 
        credDefId, 
        issuerDid, 
        null
    );

    let credentialExchangeRecord = this.createCredentialExchangeRecord(
        connectionId, 
        credentialProposalMessage, 
        generalTypes.Initiator.Self, 
        generalTypes.Roles.Holder, 
        CredentialExchangeState.Init
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

    const [,credDef] = await indy.ledger.getCredDef(null, credDefId)
    const schemaId = credDef['schemaId']

    const credentialProposalMessage = messages.createCredentialProposal(
        comment, 
        schemaId, 
        credentialPreview, 
        credDefId, 
        null, 
        null
    );

    let credentialExchangeRecord = this.createCredentialExchangeRecord(
        connectionId, 
        credentialProposalMessage, 
        generalTypes.Initiator.Self, 
        generalTypes.Roles.Issuer, 
        CredentialExchangeState.Init
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
    console.log(credentialProposalMessage);
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
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord)
    );

    return [credentialExchangeRecord, credentialOfferMessage];
}


exports.holderCreateAndSendRequest = async (credentialExchangeRecord) => {
    console.log(credentialExchangeRecord.state);
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
    
    // if(credentialExchangeRecord.credential)
    //     throw new Error(`Create credential called multiple times for credential exchange ${credentialExchangeRecord.credentialExchangeId}`);
    
    // Calculate credential request "data"   
    const [,schema] = await indy.ledger.getSchema(null, credentialExchangeRecord.schemaId);
    const encodedValues = createEncodedCredentialValues(credentialValues, schema['attrNames']);
    const credentialOffer = credentialExchangeRecord.credentialOffer;
    const credentialRequest = credentialExchangeRecord.credentialRequest;
    const [credential,,] = await indy.issuer.createCredential(
        credentialOffer, 
        credentialRequest, 
        encodedValues, 
        null, 
        -1
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
    credentialExchangeRecord.state = CredentialExchangeState.CredentialIssued;
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord)
    );

    return [credentialExchangeRecord, credentialIssuedMessage];
}

// Store credential in the wallet
exports.storeCredential = async (credentialExchangeRecord, credentialId, rawCredential) => {
    let revocRegDef = null

    const [credDefId, credDef] = await indy.ledger.getCredDef(null, rawCredential["cred_def_id"]);
    if ("rev_reg_id" in rawCredential && rawCredential["rev_reg_id"] !== null) 
        revocRegDef = await indy.ledger.getRevocRegDef(null, rawCredential["rev_reg_id"]);

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
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.CredentialExchange, 
        credentialExchangeRecord.credentialExchangeId, 
        JSON.stringify(credentialExchangeRecord)
    );

    return [credentialExchangeRecord, credentialAckMessage];
}

exports.createCredentialExchangeRecord = (connectionId, message, initiator, role, state) => {
  const treadId = (message) ? message['@id'] : null
  return {
    credentialExchangeId: uuid(),
    connectionId: connectionId,
    threadId: treadId, 
    initiator: initiator,
    role: role,
    state: state,
    credentialProposalDict: JSON.stringify(message)
  }
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
    return indy.wallet.deleteWalletRecord(
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
        console.log(attribute['name']);
        if(!schemaAttributes.includes(attribute['name'])){
            throw new Error(`Provided credential values are missing the value for the schema attribute ${attribute}`);
        }
        encodedValues[attribute['name']] = {
            'raw': attribute['value'] ? attribute['value'].toString() : null,
            'encoded': this.encode(attribute['value'])
        }
    });

    return encodedValues;
}