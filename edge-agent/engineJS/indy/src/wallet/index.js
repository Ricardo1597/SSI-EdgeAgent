'use strict';
const sdk = require('indy-sdk');
const config = require('../../../config');
const indy = require('../../index.js');
let walletHandle;
let masterSecretId;

exports.get = async function () {
  // if (!walletHandle) {
  //     throw Error('Wallet has not been initialized yet');
  // }
  return walletHandle || null;
};

exports.setup = async function (walletName, password) {
  try {
    await sdk.createWallet({ id: walletName }, { key: password });
  } catch (error) {
    // Code 203 = "WalletAlreadyExistsError"
    if (error.indyCode !== 203) {
      console.warn('create wallet failed with message: ' + error.message);
      throw error;
    }
  } finally {
    console.info('wallet already exist, try to open wallet');
  }
};

exports.open = async function (walletName, password) {
  walletHandle = await sdk.openWallet({ id: walletName }, { key: password });
  // Try to create a master secret. If it already exists, we will use it.
  try {
    masterSecretId = await sdk.proverCreateMasterSecret(walletHandle, walletName);
  } catch (error) {
    // Code 404 = "AnoncredsMasterSecretDuplicateNameError"
    if (error.indyCode == 404) {
      masterSecretId = walletName;
    } else {
      throw error;
    }
  }
  return walletHandle;
};

exports.close = async function () {
  await sdk.closeWallet(walletHandle);
  walletHandle = null;
};

exports.delete = async (username, password) => {
  if (!walletHandle) {
    throw Error('Wallet has not been initialized yet');
  }

  return await sdk.deleteWallet(username, password);
};

exports.pack = async (payload, recipientKeys, senderVk) => {
  if (!walletHandle) {
    throw Error('Wallet has not been initialized yet');
  }

  const messageRaw = Buffer.from(JSON.stringify(payload), 'utf-8');
  const packedMessage = await sdk.packMessage(walletHandle, messageRaw, recipientKeys, senderVk);
  return JSON.parse(packedMessage.toString('utf-8'));
};

exports.unpack = async (messagePackage) => {
  if (!walletHandle) {
    throw Error('Wallet has not been initialized yet');
  }

  const unpackedMessageBuffer = await sdk.unpackMessage(
    walletHandle,
    Buffer.from(JSON.stringify(messagePackage), 'utf-8')
  );
  const unpackedMessage = JSON.parse(unpackedMessageBuffer.toString('utf-8'));
  return {
    ...unpackedMessage,
    message: JSON.parse(unpackedMessage.message),
  };
};

exports.sign = async (message, attribute, verkey) => {
  if (!walletHandle) {
    throw Error('Wallet has not been initialized yet');
  }

  return await indy.crypto.sign(walletHandle, message, attribute, verkey);
};

exports.getDidVerkey = async (did) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  return await sdk.keyForLocalDid(walletHandle, did);
};

exports.createCredentialOffer = async (credDefId) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  return await sdk.issuerCreateCredentialOffer(walletHandle, credDefId);
};

exports.createCredentialRequest = async (proverDid, credOffer, credDef) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }

  return await sdk.proverCreateCredentialReq(
    walletHandle,
    proverDid,
    credOffer,
    credDef,
    masterSecretId
  );
};

exports.createCredential = async (
  credOffer,
  credReq,
  credValues,
  revRegId,
  blobStorageReaderHandle
) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  return await sdk.issuerCreateCredential(
    walletHandle,
    credOffer,
    credReq,
    credValues,
    revRegId,
    blobStorageReaderHandle
  );
};

exports.getCredentials = async () => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  return await sdk.proverGetCredentials(walletHandle, {});
};

exports.searchCredentials = async (query) => {
  const count = 10;

  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  const [searchHandle, totalCount] = await sdk.proverSearchCredentials(walletHandle, query);
  let credentials = [];
  try {
    while (true) {
      const credentialsResult = await sdk.proverFetchCredentials(searchHandle, count);

      for (let credential of credentialsResult) {
        credentials.push(credential);
      }

      if (credentialsResult.length < count) {
        break;
      }
    }
  } catch (error) {
    console.log('Error searching for credentials: ', error);
    // pass
  } finally {
    await sdk.proverCloseCredentialsSearch(searchHandle);
    return credentials;
  }
};

exports.searchCredentialsForProofRequest = async (proofReq, query = null) => {
  const count = 10;

  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  console.log('Cheguei 1.0');
  console.log(proofReq);

  let credentials = {};
  let searchHandle = await sdk.proverSearchCredentialsForProofReq(walletHandle, proofReq, query);

  console.log('Cheguei 1.1');
  try {
    console.log(proofReq);

    // requested attributes
    credentials['requested_attributes'] = {};
    for (const referent in proofReq.requested_attributes) {
      console.log('loop1');
      console.log(referent);
      console.log(proofReq.requested_attributes[referent]);
      credentials['requested_attributes'][referent] = [];
      while (true) {
        const credentialsResult = await sdk.proverFetchCredentialsForProofReq(
          searchHandle,
          referent,
          count
        );

        for (let credential of credentialsResult) {
          console.log(credential);
          credentials['requested_attributes'][referent].push(credential);
        }
        if (credentialsResult.length < count) break;
      }
    }

    await sdk.proverCloseCredentialsSearchForProofReq(searchHandle);
    searchHandle = await sdk.proverSearchCredentialsForProofReq(walletHandle, proofReq, query);

    // requested predicated
    credentials['requested_predicates'] = {};
    for (const referent in proofReq.requested_predicates) {
      console.log('loop2');
      console.log(referent);
      credentials['requested_predicates'][referent] = [];
      while (true) {
        const credentialsResult = await sdk.proverFetchCredentialsForProofReq(
          searchHandle,
          referent,
          count
        );

        for (let credential of credentialsResult) {
          console.log(credential);
          credentials['requested_predicates'][referent].push(credential);
        }
        if (credentialsResult.length < count) break;
      }
    }

    // self attested attributes
    credentials['self_attested_attributes'] = {};
    for (const referent in proofReq.self_attested_attributes) {
      console.log('loop3');
      console.log(referent);
      credentials['self_attested_attributes'][referent] = [];
      while (true) {
        const credentialsResult = await sdk.proverFetchCredentialsForProofReq(
          searchHandle,
          referent,
          count
        );

        for (let credential of credentialsResult) {
          console.log(credential);
          credentials['self_attested_attributes'][referent].push(credential);
        }
        if (credentialsResult.length < count) break;
      }
    }
  } catch (error) {
    console.log('Error searching for credentials: ', error);
    // pass
  } finally {
    await sdk.proverCloseCredentialsSearchForProofReq(searchHandle);
    return credentials;
  }
};

exports.storeCredential = async (credId, credReqMetadata, cred, credDef, revRegDef) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  try {
    return await sdk.proverStoreCredential(
      walletHandle,
      credId,
      credReqMetadata,
      cred,
      credDef,
      revRegDef
    );
  } catch (e) {
    console.log('Error while storing credential in the wallet.');
    throw new Error(e);
  }
};

exports.getCredentials = async (filter) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  return await sdk.proverGetCredentials(walletHandle, filter);
};

exports.getCredential = async (credentialId) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  return await sdk.proverGetCredential(walletHandle, credentialId);
};

exports.issuerRevokeCredentials = async (tailsLocalPath, revRegId, credRevIds) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  let tailsReaderHandler = -1;
  if (tailsLocalPath) {
    tailsReaderHandler = await indy.blobStorage.createTailsReader(tailsLocalPath);
  } else {
    throw new Error('Unable to get tails reader for revocation registry.');
  }

  let result = null;
  let invalidCredRevIds = [];

  for (const credRevId of credRevIds) {
    try {
      const delta = await sdk.issuerRevokeCredential(
        walletHandle,
        tailsReaderHandler,
        revRegId,
        credRevId
      );
      if (result) {
        result = await sdk.issuerMergeRevocationRegistryDeltas(result, delta);
      } else {
        result = delta;
      }
    } catch (error) {
      console.log('Unable to find entry for credRevId: ', credRevId);
      invalidCredRevIds.push(credRevId);
    }
  }
  return [result, invalidCredRevIds];
};

exports.createPresentation = async (
  proofReq,
  requestedCredentials,
  schemas,
  credentialDefs,
  revStates
) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  try {
    return await sdk.proverCreateProof(
      walletHandle,
      proofReq,
      requestedCredentials,
      masterSecretId,
      schemas,
      credentialDefs,
      revStates
    );
  } catch (e) {
    console.log(e);
  }
};

exports.addWalletRecord = async (type, id, value, tags) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }

  try {
    await sdk.addWalletRecord(walletHandle, type, id, value, tags);
  } catch (error) {
    if (error.indyCode === 213) {
      // WalletItemAlreadyExists
      await sdk.updateWalletRecordValue(walletHandle, type, id, value);
      await sdk.updateWalletRecordTags(walletHandle, type, id, tags);
    }
  }
};

exports.updateWalletRecordValue = async (type, id, value) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  await sdk.updateWalletRecordValue(walletHandle, type, id, value);
};

exports.addWalletRecordTags = async (type, id, tags) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  await sdk.addWalletRecordTags(walletHandle, type, id, tags);
};

exports.updateWalletRecordTags = async (type, id, tags) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  await sdk.addWalletRecordTags(walletHandle, type, id, tags);
};

exports.deleteWalletRecord = async (type, id) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  await sdk.deleteWalletRecord(walletHandle, type, id);
};

exports.searchWalletRecord = async (type, query, options) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  const searchHandle = await sdk.openWalletSearch(walletHandle, type, query, options);
  let records = [];
  try {
    while (true) {
      var recordSearch = await sdk.fetchWalletSearchNextRecords(walletHandle, searchHandle, 10);

      for (let record of recordSearch.records) {
        records.push(JSON.parse(record.value));
      }
    }
  } catch (error) {
    // pass
  } finally {
    await sdk.closeWalletSearch(searchHandle);
    return records;
  }
};

exports.getWalletRecord = async (type, id, options) => {
  if (!walletHandle) {
    throw new Error(`Wallet has not been initialized yet`);
  }
  let result = await sdk.getWalletRecord(walletHandle, type, id, options);

  return JSON.parse(result.value);
};

exports.keyForLocalDid = async (did) => {
  if (!walletHandle) {
    throw Error('Wallet has not been initialized yet');
  }

  return await sdk.keyForLocalDid(walletHandle, did);
};
