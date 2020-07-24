'use strict';

exports.wallet = require('./src/wallet');
exports.connections = require('./src/protocols/connections');
exports.credentialExchange = require('./src/protocols/issueCredential');
exports.presentationExchange = require('./src/protocols/presentProof');
exports.problemReport = require('./src/protocols/problemReport');
exports.trustPing = require('./src/protocols/trustPing');
exports.crypto = require('./src/crypto');
exports.blobStorage = require('./src/blobStorage');
exports.revocation = require('./src/revocation');
exports.did = require('./src/did');
exports.didDoc = require('./src/didDoc');
exports.handler = require('./src/handler');
exports.issuer = require('./src/issuer');
exports.holder = require('./src/holder');
exports.verifier = require('./src/verifier');
exports.messages = require('./src/messages');
exports.pairwise = require('./src/pairwise');
exports.ledger = require('./src/ledger');
exports.recordTypes = require('./src/recordTypes');
exports.utils = require('./src/utils');

exports.setupPool = async function () {
  await exports.ledger.setup();
  return Promise.resolve();
};
