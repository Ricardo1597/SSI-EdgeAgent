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
    Error: "error"
}
exports.PresentationExchangeState = PresentationExchangeState;

exports.RejectionErrors = {
    Proposal: {
        state: PresentationExchangeState.ProposalReceived,
        code: "proposal_not_accepted",
        description: "Presentation proposal rejected."
    },
    Request: {
        state: PresentationExchangeState.RequestReceived,
        code: "request_not_accepted",
        description: "Presentation request rejected."
    },
}

exports.MessageType = messages.MessageType;
exports.NewMessageType = messages.NewMessageType;

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
        PresentationExchangeState.Init,
        presentationProposalMessage['@id']
    );

    // Save created presentation exchange record in the wallet
    await this.addPresentationExchangeRecord(
        presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord), 
        {'connectionId': connectionId, 'threadId': presentationExchangeRecord.threadId}
    );

    return await this.proverSendProposal(presentationExchangeRecord);
}

exports.proverSendProposal = async (presentationExchangeRecord) => {
    const { state, connectionId, presentationExchangeId } = presentationExchangeRecord;
    const presentationProposalMessage = JSON.parse(presentationExchangeRecord.presentationProposalDict);

    if( state != PresentationExchangeState.Init) {
        throw new Error(`Invalid state trasition.`);
    }

    // Get connection to send message (presentation proposal)
    const connection = await indy.connections.getConnection(connectionId);

    // Create and send proposal message to a given endpoint
    const [message, endpoint] = await indy.messages.prepareMessage(
        presentationProposalMessage, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);

    // Save created presentation exchange record in the wallet
    presentationExchangeRecord.state = PresentationExchangeState.ProposalSent
    await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.PresentationExchange,  
        presentationExchangeId, 
        JSON.stringify(presentationExchangeRecord)
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
        PresentationExchangeState.Init,
        null
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
    if(!presentationRequest.nonce) presentationRequest.nonce = this.randomNonce();

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
        presentationExchangeRecord.updatedAt = indy.utils.getCurrentDate();
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
        
        const credDefId = credential["cred_def_id"]
        if (!(credDefId in credDefs))
            credDefs[credDefId] = (await indy.ledger.getCredDef(null, credDefId))[1];
            
        if (credential['rev_reg_id']) {
            const revRegId = credential["rev_reg_id"]
            if (!(revRegId in revocRegs)) {
                revocRegs[revRegId] = (await indy.ledger.getRevocRegDef(null, revRegId))[1];
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

        if (referentNonRevocInterval) {
            const key = `${revRegId}_${nonRevocInterval['from']}_${nonRevocInterval['to']}`;
            if (!(key in revocRegDeltas)) {
                const [, delta, deltaTimestamp] = await indy.ledger.getRevocRegDelta(
                    null,
                    revRegId,
                    nonRevocInterval["from"],
                    nonRevocInterval["to"]
                );
                revocRegDeltas[key] = {revRegId, credentialId, delta, deltaTimestamp};
            }
            reqReferents[referentKey]["timestamp"] = revocRegDeltas[key]['deltaTimestamp']
        }
    }

    return [revocRegDeltas, reqReferents];
}


const getRevocationStates = async (revocRegs, revocRegDeltas) => {
    let revocationStates = {}

    for (const key in revocRegDeltas) {
        const { revRegId, credentialId, delta, deltaTimestamp } = revocRegDeltas[key];
        if (!(revRegId in revocationStates)){
            revocationStates[revRegId] = {}
        }

        const revReg = revocRegs[revRegId]
        const credential = await indy.holder.getCredential(credentialId);
        const blobReaderHandler = await indy.blobStorage.createTailsReader(revReg["value"]["tailsLocation"])
        try {
            revocationStates[revRegId][deltaTimestamp] = await sdk.createRevocationState(
                blobReaderHandler,
                revReg,
                delta,
                deltaTimestamp,
                credential["cred_rev_id"]
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

    // Get connection to send message (presentation response)
    const connection = await indy.connections.getConnection(
        presentationExchangeRecord.connectionId
    );

    const presentationRequest = presentationExchangeRecord.presentationRequest;

    // Get all credentials needed for this presentation and save it in "credentials"
    let [credentials, reqReferents] = await getCredentials(
        reqCredentials['requested_attributes'],
        presentationRequest['requested_attributes'],
        reqCredentials['requested_predicates'],
        presentationRequest['requested_predicates']
    );

    // Get all schemas, credential definitions and revocation registries in use by the credentials
    let [schemas, credDefs, revocRegs] = await getCredentialsInformation(credentials);

    // Get delta with non-revocation interval defined in "non_revoked" of the presentation request
    // or requested credentials 
    let revocRegDeltas = {};
    [revocRegDeltas, reqReferents] = await getNonRevocationInterval(credentials, reqReferents);

    // Get revocation states to prove non-revoked state
    let revocationStates = await getRevocationStates(revocRegs, revocRegDeltas);

    // Update requested attributes and predicates with timestamp
    for (var referent in reqReferents) {
        const referented = reqReferents[referent];
        if (!("timestamp" in referented)){
            continue;
        }
        if (referent in reqCredentials["requested_attributes"]){
            reqCredentials["requested_attributes"][referent]["timestamp"] = referented["timestamp"]
        }
        if (referent in reqCredentials["requested_predicates"]){
            reqCredentials["requested_predicates"][referent]["timestamp"] = referented["timestamp"]
        }
    }
    console.log("Cheguei 4.12")
    // console.log(presentationRequest);
    // console.log(reqCredentials);
    // console.log(schemas);
    // console.log(credDefs);
    // console.log(revocationStates);

    try {
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
        presentationExchangeRecord.updatedAt = indy.utils.getCurrentDate();
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.PresentationExchange, 
            presentationExchangeRecord.presentationExchangeId, 
            JSON.stringify(presentationExchangeRecord)
        );
    
        return [presentationExchangeRecord, presentationMessage];

    } catch(error) {
        throw new Error('Error in requested credentials. Some attributes may not respect what you are trying to prove.');
    }
}


exports.verifierVerifyPresentation = async (presentationExchangeRecord) => {
    if( 
        presentationExchangeRecord.state != PresentationExchangeState.PresentationReceived &&
        presentationExchangeRecord.state != PresentationExchangeState.Done
    ) {
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
                revRegDefs[identifier["rev_reg_id"]] = (await indy.ledger.getRevocRegDef(null, identifier["rev_reg_id"]))[1];
            }
            if (identifier["timestamp"]) {
                revRegEntries[identifier["rev_reg_id"]] = {};
                
                if (!(identifier["timestamp"] in revRegEntries[identifier["rev_reg_id"]])) {
                    const [,foundRevRegEntry, foundTimestamp] = await indy.ledger.getRevocRegEntry(
                        null, 
                        identifier["rev_reg_id"], 
                        identifier["timestamp"]
                    );
                    revRegEntries[identifier["rev_reg_id"]][identifier["timestamp"]] = foundRevRegEntry;
                }
            }
        }
    }));

    // console.log(JSON.stringify(indyProofRequest))
    // console.log(JSON.stringify(indyProof))
    // console.log(JSON.stringify(schemas))
    // console.log(JSON.stringify(credDefs))
    // console.log(JSON.stringify(revRegDefs))
    // console.log(JSON.stringify(revRegEntries))

    let verified = await indy.verifier.verifyPresentation(
        indyProofRequest,
        indyProof,
        schemas,
        credDefs,
        revRegDefs,
        revRegEntries
    );
    console.log("verified: ", verified)
    if(verified) {
        console.log("Passed at presentation verification!")

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
        presentationExchangeRecord.updatedAt = indy.utils.getCurrentDate();
        await indy.wallet.updateWalletRecordValue(
            indy.recordTypes.RecordType.PresentationExchange, 
            presentationExchangeRecord.presentationExchangeId, 
            JSON.stringify(presentationExchangeRecord)
        );
        return [verified, presentationExchangeRecord, ackMessage];

    } else {
        console.log("Failed at presentation verification!")
        return [verified, presentationExchangeRecord, null];
    }

    
}


exports.createPresentationExchangeRecord = (connectionId, message, initiator, role, state, treadId) => {
    const currentDate = indy.utils.getCurrentDate();
    
    return {
        presentationExchangeId: uuid(),
        connectionId: connectionId,
        threadId: treadId, 
        initiator: initiator,
        role: role,
        state: state,
        presentationProposalDict: JSON.stringify(message),
        createdAt: currentDate,
        updatedAt: currentDate,
    }
}

// Using problem report protocol for hadling rejections
exports.rejectExchange = async (presentationExchangeRecord, rejectError) => {
    return await indy.problemReport.sendProblemReport(
        presentationExchangeRecord,
        presentationExchangeRecord.presentationExchangeId,
        rejectError,
        "thread",
        this.MessageType.ProblemReport,
        indy.recordTypes.RecordType.PresentationExchange,
        PresentationExchangeState.Error
    );
}

exports.getPresentationExchangeRecord = async (id) => {
    try {
        return await indy.wallet.getWalletRecord(indy.recordTypes.RecordType.PresentationExchange, id, {});
    } catch(error) {
        if(error.indyCode && error.indyCode === 212){
            console.log("Unable to find presentation exchange record. Wallet item not found.");
            return null;
        } else {
            throw error;
        }
    }
}

exports.searchPresentationExchangeRecord = async (query, all=false) => {
    const records = await indy.wallet.searchWalletRecord(
        indy.recordTypes.RecordType.PresentationExchange,
        query, 
        {}
    );
        
    if(records.length < 1) {
        console.log("Unable to get presentation exchange record. Wallet item not found.");
        return null;
    }

    return all ? records : records[0];
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
            return null;
        } else {
            throw error;
        }
    }
}

exports.removePresentationExchangeRecord = async (id) => {    
    // Get presentation exchange record
    const record = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.PresentationExchange, 
      id, 
      {}
    );

    // Get connection to send message (exchange termination)
    const connection = await indy.connections.getConnection(record.connectionId);

    const rejectMessage = indy.problemReport.messages.createProblemReportMessage(
        indy.presentationExchange.MessageType.ProblemReport,
        "presentation-abandoned",
        "Credential presentation abandoned.",
        "thread",
        record.threadId
    );

    const [message, endpoint] = await indy.messages.prepareMessage(
        rejectMessage, 
        connection
    );
    indy.messages.sendMessage(message, endpoint);

    await indy.wallet.deleteWalletRecord(
        indy.recordTypes.RecordType.PresentationExchange, 
        id
    );
}

exports.randomNonce = () => {
    let number1 = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)).toString();
    let number2 = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER)).toString();
    return number1 + number2; 
}