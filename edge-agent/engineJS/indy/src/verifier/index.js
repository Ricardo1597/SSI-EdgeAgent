'use strict';
const indy = require('../../index.js');
const sdk = require('indy-sdk');


exports.verifyPresentation = async function (proofRequest, proof, schemas, credentialDefinitions, revRegDefs, revRegs) {
    try {
        return await sdk.verifierVerifyProof(proofRequest, proof, schemas, credentialDefinitions, revRegDefs, revRegs);
    } catch(e) {
        console.log(e)
    }
};
