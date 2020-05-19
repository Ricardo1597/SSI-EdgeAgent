'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');


exports.createCredentialRequest = async function(proverDid, credOffer, credDef) {
    return await indy.wallet.createCredentialRequest(proverDid, credOffer, credDef);
};

exports.createPresentation = async (proofReq, requestedCredentials, schemas, credentialDefs, revStates) => {
    return await indy.wallet.createPresentation(proofReq, requestedCredentials, schemas, credentialDefs, revStates);
}

exports.getCredential = async (credentialId) => {
    return await indy.wallet.getCredential(credentialId);
}

exports.storeCredential = async (credId, credReqMetadata, cred, credDef, revRegDef) => {
    return await indy.wallet.storeCredential(credId, credReqMetadata, cred, credDef, revRegDef);
}