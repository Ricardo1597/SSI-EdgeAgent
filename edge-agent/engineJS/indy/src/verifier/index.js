'use strict';
const indy = require('../../index.js');
const sdk = require('indy-sdk');


exports.verifyPresentation = async function (proofRequest, proof, schemas, credentialDefinitions, revRegDefs, revRegs) {
    console.log(proofRequest)
    console.log(proof)
    console.log(schemas)
    console.log(credentialDefinitions)
    console.log(revRegDefs)
    console.log(revRegs)
    try {
        return await sdk.verifierVerifyProof(proofRequest, proof, schemas, credentialDefinitions, revRegDefs, revRegs);
    } catch(e) {
        console.log(e)
    }
};
