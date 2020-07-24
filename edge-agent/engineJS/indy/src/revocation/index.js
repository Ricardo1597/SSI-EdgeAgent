'use strict';
const indy = require('../../index.js');
const uuid = require('uuid');
const sdk = require('indy-sdk');

const RevocationRegistryState = {
  Init: 'init',
  Generated: 'generated',
  Published: 'published',
  Active: 'active',
  Full: 'generated',
};

exports.RevocationRegistryState = RevocationRegistryState;

const DEFAULT_REGISTRY_SIZE = 100;
const ISSUANCE_BY_DEFAULT = 'ISSUANCE_BY_DEFAULT';
const ISSUANCE_ON_DEMAND = 'ISSUANCE_ON_DEMAND';
const REVOC_DEF_TYPE_CL = 'CL_ACCUM';

exports.createAndStoreRevocReg = async (
  issuerDid,
  revocDefType,
  credDefId,
  tailsBasePath,
  maxCredNum,
  issuanceByDefault
) => {
  if (!revocDefType) {
    revocDefType = REVOC_DEF_TYPE_CL;
  }
  if (!maxCredNum) {
    maxCredNum = DEFAULT_REGISTRY_SIZE;
  }
  const issuanceType = issuanceByDefault ? ISSUANCE_BY_DEFAULT : ISSUANCE_ON_DEMAND;

  let config = {
    issuance_type: issuanceType,
    max_cred_num: maxCredNum,
  };

  try {
    const [, credDef] = await indy.ledger.getCredDef(null, credDefId);
    if (!credDef['value']['revocation']) {
      throw new Error('Credential definition does not support revocation.');
    }
    const tailsWriter = await indy.blobStorage.createTailsWriter(tailsBasePath);
    const tag = uuid();
    console.log(JSON.stringify(config));
    const [revocRegId, revocRegDef, revocRegEntry] = await sdk.issuerCreateAndStoreRevocReg(
      await indy.wallet.get(),
      issuerDid,
      revocDefType,
      tag,
      credDefId,
      config,
      tailsWriter
    );

    // Create revocation registry record
    const revocRegRecord = this.createRevocRegRecord(
      tag,
      issuerDid,
      credDefId,
      revocRegId,
      revocRegDef,
      revocRegEntry,
      revocDefType,
      maxCredNum,
      issuanceType
    );

    // Save record in the wallet
    // TAG_NAMES_IN_USE = [
    //     "credDefId",
    //     "revocRegId",
    //     "state",
    //     "hasPendingRevocations",
    // ]
    // OTHER_TAG_NAMES = [
    //     "issuer_did"
    // ]
    await this.addRevocRegRecord(revocRegRecord.recordId, JSON.stringify(revocRegRecord), {
      credDefId: revocRegRecord.credDefId,
      state: revocRegRecord.state,
      revocRegId: revocRegRecord.revocRegId,
      hasPendingRevocations: revocRegRecord.hasPendingRevocations.toString(),
    });

    let publish = true; // this must be a issuer option
    if (publish) {
      await this.publishRevocRegDef(revocRegRecord.revocRegId);
      await this.publishRevocRegEntry(revocRegRecord.revocRegId);
    }

    return [revocRegId, revocRegDef, revocRegEntry];
  } catch (error) {
    console.log('Error when creating revocation registry: ', error);
    throw error;
  }
};

exports.publishRevocRegDef = async (revocRegId) => {
  let revocRegRecord = await this.searchRevocRegRecord({ revocRegId: revocRegId });

  if (revocRegRecord.state !== RevocationRegistryState.Generated) {
    throw new Error(
      `Revocation registry ${revocRegRecord.revocRegId} in state ${revocRegRecord.state}: cannot publish revocation registry definition`
    );
  }
  await indy.ledger.sendRevocRegDef(revocRegRecord.issuerDid, revocRegRecord.revocRegDef);
  console.log('Published registry definition: ', revocRegRecord.revocRegId);

  // Update record state
  revocRegRecord.state = RevocationRegistryState.Published;
  await indy.wallet.updateWalletRecordValue(
    indy.recordTypes.RecordType.RevocationRegistry,
    revocRegRecord.recordId,
    JSON.stringify(revocRegRecord)
  );
  // Update record state tag (is it needed to pass all the tags again?)
  await indy.wallet.updateWalletRecordTags(
    indy.recordTypes.RecordType.RevocationRegistry,
    revocRegRecord.recordId,
    {
      credDefId: revocRegRecord.credDefId,
      state: revocRegRecord.state,
      revocRegId: revocRegRecord.revocRegId,
      hasPendingRevocations: revocRegRecord.hasPendingRevocations.toString(),
    }
  );
};

exports.publishRevocRegEntry = async (revocRegId) => {
  let revocRegRecord = await this.searchRevocRegRecord({ revocRegId: revocRegId });

  // Only publish if there where credentials revoked
  if (revocRegRecord.revocRegEntry) {
    if (
      revocRegRecord.state !== RevocationRegistryState.Published &&
      revocRegRecord.state !== RevocationRegistryState.Active &&
      revocRegRecord.state !== RevocationRegistryState.Full
    ) {
      throw new Error(
        `Revocation registry ${revocRegRecord.revocRegId} in state ${revocRegRecord.state}: cannot publish revocation registry entry`
      );
    }

    await indy.ledger.sendRevocRegEntry(
      revocRegRecord.issuerDid,
      revocRegRecord.revocRegId,
      REVOC_DEF_TYPE_CL,
      revocRegRecord.revocRegEntry
    );
    console.log('Published registry entry: ', revocRegId);

    if (revocRegRecord.state === RevocationRegistryState.Published) {
      // Update record state
      revocRegRecord.state = RevocationRegistryState.Active;
      await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.RevocationRegistry,
        revocRegRecord.recordId,
        JSON.stringify(revocRegRecord)
      );
      // Update record state tag (is it needed to pass all the tags again?)
      await indy.wallet.updateWalletRecordTags(
        indy.recordTypes.RecordType.RevocationRegistry,
        revocRegRecord.recordId,
        {
          credDefId: revocRegRecord.credDefId,
          state: revocRegRecord.state,
          revocRegId: revocRegRecord.revocRegId,
          hasPendingRevocations: revocRegRecord.hasPendingRevocations.toString(),
        }
      );
    }
  } else {
    console.log('No revogation registry entry to publish.');
  }
};

exports.markRevocationAsPending = async (recordId, credRevId) => {
  let revocRegRecord = await this.getRevocRegRecord(recordId);

  if (!revocRegRecord) {
    throw new Error(`No revocation registry record found with id: ${recordId}`);
  }

  if (!revocRegRecord.pendingPub.includes(credRevId)) {
    revocRegRecord.pendingPub.push(credRevId);
    // sort the array?
    revocRegRecord.hasPendingRevocations = true;

    await indy.wallet.updateWalletRecordValue(
      indy.recordTypes.RecordType.RevocationRegistry,
      revocRegRecord.recordId,
      JSON.stringify(revocRegRecord)
    );
    // Update record state tag (is it needed to pass all the tags again?)
    await indy.wallet.updateWalletRecordTags(
      indy.recordTypes.RecordType.RevocationRegistry,
      revocRegRecord.recordId,
      {
        credDefId: revocRegRecord.credDefId,
        state: revocRegRecord.state,
        revocRegId: revocRegRecord.revocRegId,
        hasPendingRevocations: revocRegRecord.hasPendingRevocations.toString(),
      }
    );
  } else {
    console.log('Credential is already in the revocation pending index.');
  }
};

exports.clearPendingRevocations = async (recordId) => {
  let revocRegRecord = await this.getRevocRegRecord(recordId);

  if (revocRegRecord.pendingPub.length > 0) {
    revocRegRecord.pendingPub = [];
    revocRegRecord.hasPendingRevocations = false;

    await indy.wallet.updateWalletRecordValue(
      indy.recordTypes.RecordType.RevocationRegistry,
      revocRegRecord.recordId,
      JSON.stringify(revocRegRecord)
    );
    // Update record state tag (is it needed to pass all the tags again?)
    await indy.wallet.updateWalletRecordTags(
      indy.recordTypes.RecordType.RevocationRegistry,
      revocRegRecord.recordId,
      {
        credDefId: revocRegRecord.credDefId,
        state: revocRegRecord.state,
        revocRegId: revocRegRecord.revocRegId,
        hasPendingRevocations: revocRegRecord.hasPendingRevocations.toString(),
      }
    );
  }
};

exports.createRevocRegRecord = (
  tag,
  issuerDid,
  credDefId,
  revocRegId,
  revocRegDef,
  revocRegEntry,
  revocDefType,
  maxCredNum,
  issuanceType
) => {
  const currentDate = indy.utils.getCurrentDate();

  return {
    recordId: tag,
    credDefId: credDefId,
    revocRegId: revocRegId,
    revocRegDef: revocRegDef,
    revocRegEntry: revocRegEntry,
    issuerDid: issuerDid,
    state: RevocationRegistryState.Generated,
    tailsHash: revocRegDef['value']['tailsHash'],
    tailsLocalPath: revocRegDef['value']['tailsLocation'],
    pendingPub: [],
    hasPendingRevocations: false,
    revocDefType: revocDefType,
    maxCredNum: maxCredNum,
    currCredNum: 0,
    issuanceType: issuanceType,
    createdAt: currentDate,
    updatedAt: currentDate,
  };
};

exports.getRevocRegRecord = async (id) => {
  try {
    return await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.RevocationRegistry,
      id,
      {}
    );
  } catch (error) {
    if (error.indyCode && error.indyCode === 212) {
      console.log('Unable to get revocation registry record. Wallet item not found.');
    }
    return null;
  }
};

exports.searchRevocRegRecord = async (query, allMatchs = false) => {
  const records = await indy.wallet.searchWalletRecord(
    indy.recordTypes.RecordType.RevocationRegistry,
    query,
    {}
  );

  if (records.length < 1) {
    console.log('Unable to get revocation registry record. Wallet item not found.');
    return null;
  }

  return allMatchs ? records : records[0];
};

exports.getAllRevocRegRecords = async () => {
  return await indy.wallet.searchWalletRecord(
    indy.recordTypes.RecordType.RevocationRegistry,
    {},
    {}
  );
};

exports.addRevocRegRecord = async (id, value, tags = {}) => {
  try {
    return await indy.wallet.addWalletRecord(
      indy.recordTypes.RecordType.RevocationRegistry,
      id,
      value,
      tags
    );
  } catch (error) {
    if (error.indyCode && error.indyCode === 213) {
      console.log('Unable to add revocation registry record. Wallet item already exists.');
    }
    //throw error;
  }
};

exports.removeRevocRegRecord = async (id) => {
  await indy.wallet.deleteWalletRecord(indy.recordTypes.RecordType.RevocationRegistry, id);
};
