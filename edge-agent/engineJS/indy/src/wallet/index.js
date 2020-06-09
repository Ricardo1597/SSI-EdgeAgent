'use strict';
const sdk = require('indy-sdk');
const config = require('../../../config');
const indy = require('../../index.js');
let walletHandle;
let masterSecretId;

exports.get = async function() {
    // if (!walletHandle) {
    //     throw Error('Wallet has not been initialized yet');
    // }
    return walletHandle || null;
};

exports.setup = async function (walletName, password) {
    try {
        await sdk.createWallet(
            {id: walletName},
            {key: password}
        );
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
    walletHandle = await sdk.openWallet(
        {id: walletName},
        {key: password}
    );
    // Try to create a master secret. If it already exists, we will use it.
    try {
        masterSecretId = await sdk.proverCreateMasterSecret(walletHandle, walletName);
    } catch (error) {
        // Code 404 = "AnoncredsMasterSecretDuplicateNameError"
        if(error.indyCode == 404) {
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
}


exports.pack = async (payload, recipientKeys, senderVk) => {
    if (!walletHandle) {
      throw Error('Wallet has not been initialized yet');
    }

    const messageRaw = Buffer.from(JSON.stringify(payload), 'utf-8');
    const packedMessage = await sdk.packMessage(walletHandle, messageRaw, recipientKeys, senderVk);
    return JSON.parse(packedMessage.toString('utf-8'));
}

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
}

exports.sign = async (message, attribute, verkey) => {
    if (!walletHandle) {
      throw Error('Wallet has not been initialized yet');
    }

    return await indy.crypto.sign(walletHandle, message, attribute, verkey);
}

exports.getDidVerkey = async (did) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.keyForLocalDid(walletHandle, did);
}


exports.createCredentialOffer = async (credDefId) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.issuerCreateCredentialOffer(walletHandle, credDefId);
}

exports.createCredentialRequest = async (proverDid, credOffer, credDef) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }

    return await sdk.proverCreateCredentialReq(walletHandle, proverDid, credOffer, credDef, masterSecretId);
}

exports.createCredential = async (credOffer, credReq, credValues, revRegId, blobStorageReaderHandle) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.issuerCreateCredential(walletHandle, credOffer, credReq, credValues, revRegId, blobStorageReaderHandle);
}

exports.getCredentials = async () => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.proverGetCredentials(walletHandle, {});
}

exports.storeCredential = async (credId, credReqMetadata, cred, credDef, revRegDef) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    try{
        return await sdk.proverStoreCredential(walletHandle, credId, credReqMetadata, cred, credDef, revRegDef);
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
}

exports.getCredentials = async (filter) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.proverGetCredentials(walletHandle, filter);
}

exports.getCredential = async (credentialId) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.proverGetCredential(walletHandle, credentialId);
}


exports.createPresentation = async (proofReq, requestedCredentials, schemas, credentialDefs, revStates) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    try{
        return await sdk.proverCreateProof(walletHandle, proofReq, requestedCredentials, masterSecretId, schemas, credentialDefs, revStates);
    } catch (e) {
        console.log(e)
    }
}


exports.addWalletRecord = async (type, id, value, tags) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.addWalletRecord(walletHandle, type, id, value, tags);
}

exports.updateWalletRecordValue = async (type, id, value) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.updateWalletRecordValue(walletHandle, type, id, value);
}

exports.addWalletRecordTags = async (type, id, tags) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.addWalletRecordTags(walletHandle, type, id, tags);
}

exports.updateWalletRecordTags = async (type, id, tags) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.addWalletRecordTags(walletHandle, type, id, tags);
}

exports.deleteWalletRecord = async (type, id) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    return await sdk.deleteWalletRecord(walletHandle, type, id);
}

exports.searchWalletRecord = async (type, query, options) => {
    if (!walletHandle) {
        throw new Error(`Wallet has not been initialized yet`);
    }
    const searchHandle = await sdk.openWalletSearch(walletHandle, type, query, options);
    let records = []
    try {
        while (true) {
            var recordSearch = await sdk.fetchWalletSearchNextRecords(walletHandle, searchHandle, 10);

            for (let record of recordSearch.records) {
                records.push(JSON.parse(record.value))
            }
        }
    } catch (error) {
        // pass
    } finally {
        await sdk.closeWalletSearch(searchHandle);
        return records;
    }
}



exports.getWalletRecord = async (type, id, options) => {
    if (!walletHandle) {
      throw new Error(`Wallet has not been initialized yet`);
    }
    let result = await sdk.getWalletRecord(walletHandle, type, id, options);

    return JSON.parse(result.value)
  }

exports.keyForLocalDid = async (did) => {
    if (!walletHandle) {
        throw Error('Wallet has not been initialized yet');
    }

    return await sdk.keyForLocalDid(walletHandle, did);
}

