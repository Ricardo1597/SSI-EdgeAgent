'use strict';
const indy = require('../../../index.js');
const uuid = require('uuid');
const sdk = require('indy-sdk');
const messages = require('./messages')
const generalTypes = require('../generalTypes')

exports.handlers = require('./handlers');


const PresentationExchangeState = {
    Init: "init",
    ProposalSent: "proposal_sent",
    ProposalReceived: "proposal_received",
    RequestSent: "request_sent",
    RequestReceived: "request_received",
    PresentationSent: "presentation_sent",
    PresentationReceived: "presentation_received",
    PresentationVerified: "presentation_verified",
    Done: "done",
}

exports.PresentationExchangeState = PresentationExchangeState;

exports.MessageType = messages.MessageType;

// Prover starts exchange at presentation proposal
exports.proverCreateAndSendProposal = async (connectionId, comment, presentationPreview) => {
    // Get connection to send message (presentation proposal)
    const connection = await indy.connections.getConnection(
        connectionId
    );
    
    const presentationProposalMessage = messages.createPresentationProposal(
        comment, 
        presentationPreview
    );

    let presentationExchangeRecord = this.createPresentationExchangeRecord(
        connectionId, 
        presentationProposalMessage, 
        generalTypes.Initiator.Self, 
        generalTypes.Roles.Prover, 
        PresentationExchangeState.ProposalSent
    );
    
    // Create and send proposal message to a given endpoint
    const [message, endpoint] = await indy.messages.prepareMessage(
        presentationProposalMessage, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);

    // Save created presentation exchange record in the wallet
    await this.addPresentationExchangeRecord(
        presentationExchangeRecord.presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord), 
        {'connectionId': connection.connectionId, 'threadId': presentationExchangeRecord.threadId}
    );
    
    return [presentationExchangeRecord, presentationProposalMessage];
}


// Verifier starts exchange at presentation request (jumpping presentation proposal phase)
exports.verifierCreatePresentationExchangeRecord = (connectionId) => {
    let presentationExchangeRecord = this.createPresentationExchangeRecord(
        connectionId, 
        null, 
        generalTypes.Initiator.Self, 
        generalTypes.Roles.Verifier, 
        PresentationExchangeState.Init
    );
           
    return presentationExchangeRecord;
}


exports.verifierCreateAndSendRequest = async (presentationExchangeRecord, comment, presentationRequest) => {
    const state = presentationExchangeRecord.state
    if( state != PresentationExchangeState.Init && state != PresentationExchangeState.ProposalReceived) {
        throw new Error(`Invalid state trasition.`);
    }

    console.log("Cheguei 3")
    // Get connection to send message (presentation request)
    const connection = await indy.connections.getConnection(
        presentationExchangeRecord.connectionId
    );

    // Generate nonce if none is passed
    if(!presentationRequest.nonce) presentationRequest.nonce = randomNonce();

    // Encode data for request message
    const data = Buffer.from(JSON.stringify(presentationRequest)).toString("base64");
    // Create request message
    let presentationRequestMessage = messages.createPresentationRequest(
        comment, 
        data,
        presentationExchangeRecord.threadId
    );

    // Prepare and send message to prover
    const [message, endpoint] = await indy.messages.prepareMessage(
        presentationRequestMessage, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);

    // Update thread id with the first exchanged message (request) 
    if(!presentationExchangeRecord.threadId){
        presentationExchangeRecord.threadId = presentationRequestMessage['~thread']['thid']
    }
    presentationExchangeRecord.presentationRequest = presentationRequest;
    presentationExchangeRecord.state = PresentationExchangeState.RequestSent;

    // Save presentation exchange record in the wallet
    if(presentationExchangeRecord.initiator === "self") {
        // Prover sent proposal first
        await this.addPresentationExchangeRecord(
            presentationExchangeRecord.presentationExchangeId, 
            JSON.stringify(presentationExchangeRecord),
            {
                'connectionId': connection.connectionId, 
                'threadId': presentationRequestMessage['~thread']['thid']
            }
        );
    } else {
        // Verifier sent request first
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.PresentationExchange, 
            presentationExchangeRecord.presentationExchangeId, 
            JSON.stringify(presentationExchangeRecord)
        );

    }

    return [presentationExchangeRecord, presentationRequestMessage];
}


const getCredentials = async (attrCreds, reqAttrs, predsCreds, reqPreds) => {
    let credentials = {};
    let reqReferents = {};

    // Note: "non_revoked" values will be used to calculate non-revocation intervals after
    // all the schemas, credential definitions and revocation registries are retrieved.
    for (var referent in attrCreds) {
        reqReferents[referent] = {"cred_id": attrCreds[referent]["cred_id"]};
        // check if request attributes have revocation timestamp restritions
        if (referent in reqAttrs && "non_revoked" in reqAttrs[referent])
            reqReferents[referent]["non_revoked"] = reqAttrs[referent]["non_revoked"];
    }
    for (var referent in predsCreds) {
        reqReferents[referent] = {"cred_id": predsCreds[referent]["cred_id"]};
        // check if request predicates have revocation timestamp restritions
        if (referent in reqPreds && "non_revoked" in reqAttrs[referent])
            reqReferents[referent]["non_revoked"] = reqPreds[referent]["non_revoked"];
    }
    // use the IDs gathered to get all the credentials needed
    for (var referent in reqReferents) {
        let credentialId = reqReferents[referent]["cred_id"];
        if (!(credentialId in credentials))
            credentials[credentialId] = await indy.holder.getCredential(credentialId);
    }

    return [credentials, reqReferents];
}


const getCredentialsInformation = async (credentials) => {
    let schemas = {};
    let credDefs = {};
    let revocRegs = {};

    for (var credentialKey in credentials) {
        const credential = credentials[credentialKey];
        const schemaId = credential["schema_id"];
        if (!(schemaId in schemas))
            schemas[schemaId] = (await indy.ledger.getSchema(null, schemaId))[1];
        
        console.log("Cheguei 4.4")

        const credDefId = credential["cred_def_id"]
        if (!(credDefId in credDefs))
            credDefs[credDefId] = (await indy.ledger.getCredDef(null, credDefId))[1];
            
        console.log("Cheguei 4.5")

        if (credential['rev_reg_id']) {
            const revRegId = credential["rev_reg_id"]
            if (!(revRegId in revocRegs)) {
                revocRegs[revRegId] = (await indy.ledger.getRevocRegDef(revRegId))[1];
            }
        }
    }

    return [schemas, credDefs, revocRegs];
}


const getNonRevocationInterval = async (credentials, reqReferents) => {
    let revocRegDeltas = {};

    // set default non revocated interval
    const currentTimestamp = parseInt(new Date().getTime() / 1000);
    const nonRevocInterval = {"from": 0, "to": currentTimestamp};
    
    for (var referentKey in reqReferents) {
        const referented = reqReferents[referentKey];
        let credentialId = referented["cred_id"];
        if (!credentials[credentialId]["rev_reg_id"])
            continue;

        const revRegId = credentials[credentialId]["rev_reg_id"];
        const referentNonRevocInterval = ("non_revoked" in referented) ? referented["non_revoked"] 
                                                                       : nonRevocInterval;

        console.log("Cheguei 4.7")
        if (referentNonRevocInterval) {
            const key = `${revRegId}_${nonRevocInterval['from']}_${nonRevocInterval['to']}`;
            if (!(key in revocRegDeltas)) {
                [delta, deltaTimestamp] = await indy.ledger.getRevocRegDelta(
                    null,
                    revRegId,
                    nonRevocInterval["from"],
                    nonRevocInterval["to"]
                );
                revocRegDeltas[key] = (revRegId, credentialId, delta, deltaTimestamp);
            }
            reqReferents[referentKey]["timestamp"] = revocRegDeltas[key][3]
        }
    }

    return [revocRegDeltas, reqReferents];
}


const getRevocationStates = async (revocRegs, revocRegDeltas) => {
    let revocationStates = {}

    for (const key in revocRegDeltas) {
        [revRegId, credentialId, delta, deltaTimestamp] = revocRegDeltas[key]
        if (!(revRegId in revocationStates))
            revocationStates[revRegId] = {}
        
        console.log("Cheguei 4.9")

        const revReg = revocRegs[revRegId]
        const blobReaderHandler = await indy.blobStorage.createTailsReader(revReg["value"]["tailsLocation"])
        console.log("Cheguei 4.10")

        try {
            revocationStates[revRegId][deltaTimestamp] = JSON.parse(
                await sdk.createRevocationState(
                    blobReaderHandler,
                    revReg,
                    delta,
                    deltaTimestamp,
                    credential["rev_reg_id"]
                )
            );
        } catch(e) {
            console.log(`Failed to create revocation state: ${e.error_code}, ${e.message}`);
            throw new Error(e);
        }
    }
    return revocationStates;
}


exports.proverCreateAndSendPresentation = async (presentationExchangeRecord, reqCredentials) => {
    if( presentationExchangeRecord.state != PresentationExchangeState.RequestReceived) {
        throw new Error(`Invalid state trasition.`);
    }

    console.log("Cheguei 4")
    // Get connection to send message (presentation response)
    const connection = await indy.connections.getConnection(
        presentationExchangeRecord.connectionId
    );
    console.log("Cheguei 4.1")

    const presentationRequest = presentationExchangeRecord.presentationRequest;

    // Get all credentials needed for this presentation and save it in "credentials"
    let [credentials, reqReferents] = await getCredentials(
        reqCredentials['requested_attributes'],
        presentationRequest['requested_attributes'],
        reqCredentials['requested_predicates'],
        presentationRequest['requested_predicates']
    );

    console.log("Cheguei 4.3")

    // Get all schemas, credential definitions and revocation registries in use by the credentials
    let [schemas, credDefs, revocRegs] = await getCredentialsInformation(credentials);

    console.log("Cheguei 4.6")

    // Get delta with non-revocation interval defined in "non_revoked" of the presentation request
    // or requested credentials 
    let revocRegDeltas = {};
    [revocRegDeltas, reqReferents] = await getNonRevocationInterval(credentials, reqReferents);

    console.log("Cheguei 4.8")

    // Get revocation states to prove non-revoked state
    let revocationStates = await getRevocationStates(revocRegs, revocRegDeltas);
    console.log("Cheguei 4.11")

    // Update requested attributes and predicates with timestamp
    for (var referent in reqReferents) {
        const referented = reqReferents[referent];
        if (!("timestamp" in referented))
            continue
        if (referent in reqCredentials["requested_attributes"])
            reqCredentials["requested_attributes"][referent]["timestamp"] = referented["timestamp"]
        if (referent in reqCredentials["requested_predicates"])
            reqCredentials["requested_predicates"][referent]["timestamp"] = referented["timestamp"]
    }
    console.log("Cheguei 4.12")

    // Calculate and encode data for presentation message
    let presentation = await indy.holder.createPresentation(
        presentationRequest, 
        reqCredentials, 
        schemas, 
        credDefs, 
        revocationStates
    );
    console.log("Cheguei 4.13")
    const data = Buffer.from(JSON.stringify(presentation)).toString("base64");
    // Create request message
    let presentationMessage = messages.createPresentation(
        null, 
        data,
        presentationExchangeRecord.threadId
    );

    // Prepare and send presentation message to prover
    const [message, endpoint] = await indy.messages.prepareMessage(
        presentationMessage, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);

    // Update presentation exchange record
    presentationExchangeRecord.presentation = presentation;
    presentationExchangeRecord.state = PresentationExchangeState.PresentationSent;
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.PresentationExchange, 
        presentationExchangeRecord.presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord)
    );

    return [presentationExchangeRecord, presentationMessage];
}


exports.verifierVerifyPresentation = async (presentationExchangeRecord) => {
    if( presentationExchangeRecord.state != PresentationExchangeState.PresentationReceived) {
        throw new Error(`Invalid state trasition.`);
    }

    // Get connection to send message (presentation ack)
    const connection = await indy.connections.getConnection(
        presentationExchangeRecord.connectionId
    );

    // Verify presentation
    const indyProofRequest = presentationExchangeRecord.presentationRequest;
    const indyProof = presentationExchangeRecord.presentation;

    let schemas = {};
    let credDefs = {};
    let revRegDefs = {};
    let revRegEntries = {};

    const identifiers = indyProof["identifiers"]
    
    await Promise.all(identifiers.map(async (identifier) => {
        console.log(identifier)

        if (!(identifier["schema_id"] in schemas)) {
            schemas[identifier["schema_id"]] = (await indy.ledger.getSchema(null, identifier["schema_id"]))[1];
        }
        if (!(identifier["cred_def_id"] in credDefs)) {
            credDefs[identifier["cred_def_id"]] = (await indy.ledger.getCredDef(null, identifier["cred_def_id"]))[1];
        }

        if (identifier["rev_reg_id"]) {
            if (!(identifier["rev_reg_id"] in revRegDefs)) {
                revRegDefs[identifier["rev_reg_id"]] = (await indy.ledger.getRevocRegDef(identifier["rev_reg_id"]))[1];
            }
            if (identifier["timestamp"]) {
                revRegEntries[identifier["rev_reg_id"]] = {};

                if (!(identifier["timestamp"] in revRegEntries[identifier["rev_reg_id"]])) {
                    [foundRevRegEntry, foundTimestamp] = await indy.ledger.getRevocRegEntry( 
                        identifier["rev_reg_id"], 
                        identifier["timestamp"]
                    );
                    revRegEntries[identifier["rev_reg_id"]][identifier["timestamp"]] = foundRevRegEntry;
                }
            }
        }
    }));

    let verified = await indy.verifier.verifyPresentation(
        indyProofRequest,
        indyProof,
        schemas,
        credDefs,
        revRegDefs,
        revRegEntries
    );
    if(!verified) {
        Console.log("Failed at presentation verification!")
    }
    
    // Create ack message
    const ackMessage = messages.createPresentationAckMessage(
        presentationExchangeRecord.threadId
    );

    // Prepare and send message to prover
    const [message, endpoint] = await indy.messages.prepareMessage(ackMessage, connection);
    indy.messages.sendMessage(message, endpoint);

    // Update presentation exchange record
    presentationExchangeRecord.verified = JSON.stringify(verified);
    presentationExchangeRecord.state = PresentationExchangeState.Done;
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.PresentationExchange, 
        presentationExchangeRecord.presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord)
    );

    return [presentationExchangeRecord, ackMessage];
}


exports.createPresentationExchangeRecord = (connectionId, message, initiator, role, state) => {
    const treadId = (message) ? message['@id'] : null
    return {
        presentationExchangeId: uuid(),
        connectionId: connectionId,
        threadId: treadId, 
        initiator: initiator,
        role: role,
        state: state,
        presentationProposalDict: JSON.stringify(message)
    }
}

exports.getPresentationExchangeRecord = async (id) => {
    try {
        return await indy.wallet.getWalletRecord(indy.recordTypes.RecordType.PresentationExchange, id, {});
    } catch(error) {
        if(error.indyCode && error.indyCode === 212){
            console.log("Unable to get presentation exchange record. Wallet item not found.");
        }
        throw error;
    }
}

exports.searchPresentationExchangeRecord = async (query) => {
    const records = await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.PresentationExchange,
        query, 
        {}
    );
        
    if(records.length < 1)
        throw new Error(`Presentation exchange record not found!`);

    return records[0];
}

exports.getAllPresentationExchangeRecords = async () => {
    return await indy.wallet.searchWalletRecord(indy.recordTypes.RecordType.PresentationExchange, {}, {});
}

exports.addPresentationExchangeRecord = async (id, value, tags={}) => {
    try {
        return await indy.wallet.addWalletRecord(
            indy.recordTypes.RecordType.PresentationExchange,
            id,
            value,
            tags
        );
    } catch(error) {
        if(error.indyCode && error.indyCode === 213){
            console.log("Unable to add presentation exchange record. Wallet item already exists.");
        }
        throw error;
    }
}

exports.removePresentationExchangeRecord = async (id) => {
    return indy.wallet.deleteWalletRecord(indy.recordTypes.RecordType.PresentationExchange, id);
}

function randomNonce() {
    let number1 = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)).toString();
    let number2 = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)).toString();
    return number1 + number2; 
}