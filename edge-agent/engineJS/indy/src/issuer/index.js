'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');

exports.createSchema = async (did, name, version, attributes) => {
    let [id, schema] = await sdk.issuerCreateSchema(did, name, version, attributes);
    await this.sendSchema(await indy.ledger.get(), await indy.wallet.get(), did, schema)
    await indy.did.pushDidAttribute(did, 'schemas', id);
    return [id, schema]
};

// exports.getSchemas = async function () {
//     let metadata = JSON.parse(await sdk.getDidMetadata(await indy.wallet.get(), await indy.did.getEndpointDid()));
//     let schemas = [];
//     for (let schemaId of metadata.schemas) {
//         let schema = await indy.ledger.getSchema(null, schemaId);
//         schemas.push(schema);
//     }
//     return schemas;
// };

exports.createCredDef = async (did, schemaId, tag) => {
    let [, schema] = await indy.ledger.getSchema(null, schemaId);
    let [credDefId, credDefJson] = await sdk.issuerCreateAndStoreCredentialDef(await indy.wallet.get(), did, schema, tag, 'CL', '{"support_revocation": false}');
    await this.sendCredDef(await indy.ledger.get(), await indy.wallet.get(), did, credDefJson)
    credDefJson.schemaId_long = schemaId;
    await indy.did.pushDidAttribute(did, 'credential_definitions', credDefJson);
    return [credDefId, credDefJson]
};

exports.sendSchema = async function(poolHandle, walletHandle, did, schema) {
    let schemaRequest = await sdk.buildSchemaRequest(did, schema);
    await sdk.signAndSubmitRequest(poolHandle, walletHandle, did, schemaRequest)
};

exports.sendCredDef = async function (poolHandle, walletHandle, did, credDef) {
    let credDefRequest = await sdk.buildCredDefRequest(did, credDef);
    await sdk.signAndSubmitRequest(poolHandle, walletHandle, did, credDefRequest);
};

exports.createCredentialOffer = async (credDefId) => {
    return await indy.wallet.createCredentialOffer(credDefId);
};

exports.createCredential = async (credOffer, credReq, credValues, revRegId, blobStorageReaderHandle) => {
    return await indy.wallet.createCredential(credOffer, credReq, credValues, revRegId, blobStorageReaderHandle);
};

// exports.getCredDefByTag = async function(credDefTag) {
//     let credDefs = await indy.did.getEndpointDidAttribute('credential_definitions');
//     for(let credDef of credDefs) {
//         if(credDef.tag === credDefTag) {
//             return credDef;
//         }
//     }
// };