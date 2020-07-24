'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');

exports.createSchema = async (did, name, version, attributes) => {
  let [id, schema] = await sdk.issuerCreateSchema(did, name, version, attributes);
  await indy.ledger.sendSchema(did, schema);
  await indy.did.addValueToDidAttribute(did, 'schemas', id);
  return [id, schema];
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

exports.createCredDef = async (did, schemaId, tag, supportRevocation = false) => {
  const options = {
    support_revocation: supportRevocation,
  };
  console.log(supportRevocation);
  let [, schema] = await indy.ledger.getSchema(null, schemaId);
  let [credDefId, credDefJson] = await sdk.issuerCreateAndStoreCredentialDef(
    await indy.wallet.get(),
    did,
    schema,
    tag,
    'CL',
    JSON.stringify(options)
  );
  console.log(credDefJson);
  await indy.ledger.sendCredDef(did, credDefJson);
  credDefJson.schemaId_long = schemaId;
  await indy.did.addValueToDidAttribute(did, 'credential_definitions', credDefJson);
  return [credDefId, credDefJson];
};

exports.createCredentialOffer = async (credDefId) => {
  return await indy.wallet.createCredentialOffer(credDefId);
};

exports.createCredential = async (
  credOffer,
  credReq,
  credValues,
  revRegId,
  blobStorageReaderHandle
) => {
  return await indy.wallet.createCredential(
    credOffer,
    credReq,
    credValues,
    revRegId,
    blobStorageReaderHandle
  );
};

// exports.getCredDefByTag = async function(credDefTag) {
//     let credDefs = await indy.did.getEndpointDidAttribute('credential_definitions');
//     for(let credDef of credDefs) {
//         if(credDef.tag === credDefTag) {
//             return credDef;
//         }
//     }
// };
