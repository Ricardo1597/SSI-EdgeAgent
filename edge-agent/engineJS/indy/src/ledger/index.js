'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
const config = require('../../../config');
const mkdirp = require('mkdirp');
const fs = require('fs');
const os = require('os');
let poolHandle;

exports.get = async function () {
  if (!poolHandle) {
    await exports.setup();
  }
  return poolHandle;
};

exports.setup = async function () {
  // see PlenumProtocolVersion or indy-plenum.common.constans.CURRENT_PROTOCOL_VERSION
  await sdk.setProtocolVersion(2);

  let poolGenesisTxnPath = await exports.getPoolGenesisTxnPath(config.poolName);
  let poolConfig = {
    genesis_txn: poolGenesisTxnPath,
  };
  try {
    await sdk.createPoolLedgerConfig(config.poolName, poolConfig);
  } catch (e) {
    if (e.message !== 'PoolLedgerConfigAlreadyExistsError') {
      throw e;
    }
  } finally {
    poolHandle = await sdk.openPoolLedger(config.poolName);
  }
};

exports.getPoolGenesisTxnPath = async function (poolName) {
  let path = `${os.tmpdir()}/indy/${poolName}.txn`;
  await savePoolGenesisTxnFile(path);
  return path;
};

async function poolGenesisTxnData() {
  let poolIp = config.testPoolIp;
  return `{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","blskey_pop":"RahHYiCvoNCtPTrVtP7nMC5eTYrsUA8WjXbdhNc8debh1agE9bGiJxWBXYNFbnJXoXhWFMvyqhqhRoq737YQemH5ik9oL7R4NTTCz2LEZhkgLJzB3QRQqJyBNyv7acbdHrAT8nQ9UkLbaVL9NBpnWXBTw4LEMePaSHEw66RzPNdAX1","client_ip":"${poolIp}","client_port":9702,"node_ip":"${poolIp}","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}
            {"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","blskey_pop":"Qr658mWZ2YC8JXGXwMDQTzuZCWF7NK9EwxphGmcBvCh6ybUuLxbG65nsX4JvD4SPNtkJ2w9ug1yLTj6fgmuDg41TgECXjLCij3RMsV8CwewBVgVN67wsA45DFWvqvLtu4rjNnE9JbdFTc1Z4WCPA3Xan44K1HoHAq9EVeaRYs8zoF5","client_ip":"${poolIp}","client_port":9704,"node_ip":"${poolIp}","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}
            {"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","blskey_pop":"QwDeb2CkNSx6r8QC8vGQK3GRv7Yndn84TGNijX8YXHPiagXajyfTjoR87rXUu4G4QLk2cF8NNyqWiYMus1623dELWwx57rLCFqGh7N4ZRbGDRP4fnVcaKg1BcUxQ866Ven4gw8y4N56S5HzxXNBZtLYmhGHvDtk6PFkFwCvxYrNYjh","client_ip":"${poolIp}","client_port":9706,"node_ip":"${poolIp}","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}
            {"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","blskey_pop":"RPLagxaR5xdimFzwmzYnz4ZhWtYQEj8iR5ZU53T2gitPCyCHQneUn2Huc4oeLd2B2HzkGnjAff4hWTJT6C7qHYB1Mv2wU5iHHGFWkhnTX9WsEAbunJCV2qcaXScKj4tTfvdDKfLiVuU2av6hbsMztirRze7LvYBkRHV3tGwyCptsrP","client_ip":"${poolIp}","client_port":9708,"node_ip":"${poolIp}","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}`;
}

async function savePoolGenesisTxnFile(filePath) {
  let data = await poolGenesisTxnData();
  await mkdir(filePath);
  return fs.writeFileSync(filePath, data, 'utf8');
}

async function mkdir(filePath) {
  return new Promise((resolve, reject) => {
    let folderPath = filePath
      .split('/')
      .slice(0, filePath.split('/').length - 1)
      .join('/');
    mkdirp(folderPath, function (err, res) {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

exports.sendNym = async (authDid, newDid, newVerKey, role) => {
  let nymRequest = await sdk.buildNymRequest(authDid, newDid, newVerKey, null, role);
  return await sdk.signAndSubmitRequest(poolHandle, await indy.wallet.get(), authDid, nymRequest);
};

exports.getNym = async (did) => {
  let getDidRequest = await sdk.buildGetNymRequest(null, did);
  return await sdk.submitRequest(poolHandle, getDidRequest);
};

exports.createNymDocument = async (did, verkey = null) => {
  if (!verkey) verkey = await sdk.keyForDid(poolHandle, await indy.wallet.get(), did);
  const didDoc = indy.didDoc.createDidDoc(did, verkey);

  // Set created did doc as an attribute of the ledger did
  return await this.setDidAttribute(did, did, null, { 'did-document': didDoc }, null);
};

exports.getTxn = async (did, type, seqNo) => {
  let getTxnRequest = await sdk.buildGetTxnRequest(did, type, seqNo);
  let getTxnResponse = await sdk.submitRequest(poolHandle, getTxnRequest);
  return getTxnResponse.result.data;
};

exports.getSchemaBySeqNo = async (did, type, seqNo) => {
  const txn = (await this.getTxn(did, type, seqNo))['txn'];
  if (txn.type === '101') {
    // schema txn type
    const originDid = txn.metadata.from;
    const name = txn.data.data.name;
    const version = txn.data.data.version;
    const schemaId = `${originDid}:2:${name}:${version}`;
    return this.getSchema(null, schemaId);
  } else {
    throw new Error(`Unable to get schema with seqence number ${seqNo} from ledger`);
  }
};

exports.getSchema = async (did, schemaId) => {
  let getSchemaRequest = await sdk.buildGetSchemaRequest(did, schemaId);
  let getSchemaResponse = await sdk.submitRequest(poolHandle, getSchemaRequest);
  return await sdk.parseGetSchemaResponse(getSchemaResponse);
};

exports.sendSchema = async function (did, schema) {
  let schemaRequest = await sdk.buildSchemaRequest(did, schema);
  await sdk.signAndSubmitRequest(poolHandle, await indy.wallet.get(), did, schemaRequest);
};

exports.getCredDef = async (did, credDefId) => {
  let getCredDefRequest = await sdk.buildGetCredDefRequest(did, credDefId);
  let getCredDefResponse = await sdk.submitRequest(poolHandle, getCredDefRequest);
  return await sdk.parseGetCredDefResponse(getCredDefResponse);
};

exports.sendCredDef = async function (did, credDef) {
  let credDefRequest = await sdk.buildCredDefRequest(did, credDef);
  await sdk.signAndSubmitRequest(poolHandle, await indy.wallet.get(), did, credDefRequest);
};

exports.getRevocRegDef = async (did, revocRegDefId) => {
  let getRevocRegDefRequest = await sdk.buildGetRevocRegDefRequest(did, revocRegDefId);
  let getRevocRegDefResponse = await sdk.submitRequest(poolHandle, getRevocRegDefRequest);
  return await sdk.parseGetRevocRegDefResponse(getRevocRegDefResponse);
};

exports.sendRevocRegDef = async (did, revocRegDef) => {
  let revocRegDefRequest = await sdk.buildRevocRegDefRequest(did, revocRegDef);
  await sdk.signAndSubmitRequest(poolHandle, await indy.wallet.get(), did, revocRegDefRequest);
};

exports.getRevocRegDelta = async (did, revocRegDefId, from, to) => {
  let getRevocRegDeltaRequest = await sdk.buildGetRevocRegDeltaRequest(
    did,
    revocRegDefId,
    from,
    to
  );
  let getRevocRegDeltaResponse = await sdk.submitRequest(poolHandle, getRevocRegDeltaRequest);
  return await sdk.parseGetRevocRegDeltaResponse(getRevocRegDeltaResponse);
};

exports.getRevocRegEntry = async (did, revocRegDefId, timestamp) => {
  let getRevocRegRequest = await sdk.buildGetRevocRegRequest(did, revocRegDefId, timestamp);
  let getRevocRegResponse = await sdk.submitRequest(poolHandle, getRevocRegRequest);
  return await sdk.parseGetRevocRegResponse(getRevocRegResponse);
};

exports.sendRevocRegEntry = async (did, revocRegDefId, revDefType, value) => {
  let revocRegDefEntryRequest = await sdk.buildRevocRegEntryRequest(
    did,
    revocRegDefId,
    revDefType,
    value
  );
  await sdk.signAndSubmitRequest(poolHandle, await indy.wallet.get(), did, revocRegDefEntryRequest);
};

exports.getDidAttribute = async (submitterDid, targetDid, hash, raw, enc) => {
  let getAttribRequest = await sdk.buildGetAttribRequest(submitterDid, targetDid, raw, hash, enc);
  let attributeResponse = await sdk.submitRequest(poolHandle, getAttribRequest);
  return JSON.parse(attributeResponse.result.data)[raw];
};

exports.setDidAttribute = async (submitterDid, targetDid, hash, raw, enc) => {
  let setAttribRequest = await sdk.buildAttribRequest(submitterDid, targetDid, hash, raw, enc);
  return await sdk.signAndSubmitRequest(
    poolHandle,
    await indy.wallet.get(),
    submitterDid,
    setAttribRequest
  );
};

// exports.proverGetEntitiesFromLedger = async function(identifiers) {
//     let schemas = {};
//     let credDefs = {};
//     let revStates = {};

//     for(let referent of Object.keys(identifiers)) {
//         let item = identifiers[referent];
//         let receivedSchema = await this.getSchema(item['schema_id']);
//         schemas[receivedSchema.id] = receivedSchema;

//         let [receivedCredDefId, receivedCredDef] = await this.getCredDef(poolHandler, await indy.did.getEndpointDid(), item['cred_def_id']);
//         credDefs[receivedCredDefId] = receivedCredDef;

//         if (item.rev_reg_seq_no) {
//             // TODO Create Revocation States
//         }
//     }

//     return [schemas, credDefs, revStates];
// };

// exports.verifierGetEntitiesFromLedger = async function(identifiers) {
//     let schemas = {};
//     let credDefs = {};
//     let revRegDefs = {};
//     let revRegs = {};

//     for(let referent of Object.keys(identifiers)) {
//         let item = identifiers[referent];
//         let receivedSchema = await this.getSchema(item['schema_id']);
//         schemas[receivedSchema.id] = receivedSchema;

//         let [receivedCredDefId, receivedCredDef] = await this.getCredDef(poolHandler, await indy.did.getEndpointDid(), item['cred_def_id']);
//         credDefs[receivedCredDefId] = receivedCredDef;

//         if (item.rev_reg_seq_no) {
//             // TODO Get Revocation Definitions and Revocation Registries
//         }
//     }
//     return [schemas, credDefs, revRegDefs, revRegs];
// };

// async function waitUntilApplied(ph, req, cond) {
//     for (let i = 0; i < 3; i++) {
//         let res = await sdk.submitRequest(ph, req);

//         if (cond(res)) {
//             return res;
//         }

//         await indy.utils.sleep(5 * 1000);
//     }
// }
