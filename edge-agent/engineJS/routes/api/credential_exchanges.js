var express = require('express');
var router = express.Router();
var passport = require('passport')
const indy = require('../../indy/index.js');


// Get all credential exchange records
router.get('/', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let records = await indy.credentialExchange.getAllCredentialExchangeRecords();
    
    res.status(200).send({records});
});

  
// Get credential exchange record by id
router.get('/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let record = await indy.credentialExchange.getCredentialExchangeRecord(req.params.id);
  
    res.status(200).send({record});
});
  
  
// Remove credential exchange record by id
router.delete('/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await indy.credentialExchange.removeCredentialExchangeRecord(req.params.id);
  
    res.status(200).send({id: req.params.id});
});
  
  
// Holder send credential exchange proposal
router.post('/send_proposal', passport.authenticate('jwt', {session: false}), async function (req, res) {
  
    const [record, messageSent] = await indy.credentialExchange.holderCreateAndSendProposal(
      req.body.connectionId, 
      req.body.comment, 
      req.body.credAttributes, 
      req.body.schemaId, 
      req.body.credDefId
    );
    res.status(200).send({record, messageSent});
});
  
  
// Issuer send credential exchange offer
router.post('/send__offer', passport.authenticate('jwt', {session: false}), async function (req, res) {
    const [record, messageSent] = await indy.credentialExchange.exchangeStartAtOffer(
      req.body.connectionId,
      req.body.comment,
      req.body.credAttributes,
      req.body.credDefId,
    );
    res.status(200).send({record, messageSent});
});
  
  
// Issuer send credential exchange offer
router.post('/:id/send_offer', passport.authenticate('jwt', {session: false}), async function (req, res) {
    // Get credential exchange record
    let credentialExchangeRecord = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.CredentialExchange, 
      req.params.id, 
      {}
    );
  
    const [record, messageSent] = await indy.credentialExchange.issuerCreateAndSendOffer(
      credentialExchangeRecord, 
      null
    );
    res.status(200).send({record, messageSent});
});
  
  
// Holder send credential exchange request
router.post('/:id/send_request', passport.authenticate('jwt', {session: false}), async function (req, res) {
    // Get credential exchange record
    let credentialExchangeRecord = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.CredentialExchange, 
      req.params.id, 
      {}
    );
  
    const [record, messageSent] = await indy.credentialExchange.holderCreateAndSendRequest(
      credentialExchangeRecord
    );
    res.status(200).send({record, messageSent});
});
  
  
// Issuer send credential exchange credential
router.post('/:id/send_credential', passport.authenticate('jwt', {session: false}), async function (req, res) {
    // Get credential exchange record
    let credentialExchangeRecord = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.CredentialExchange, 
      req.params.id, 
      {}
    );
  
    const [record, messageSent] = await indy.credentialExchange.issuerCreateAndSendCredential(
      credentialExchangeRecord, 
      req.body.comment,
      req.body.credAttributes
    );
    res.status(200).send({record, messageSent});
});

module.exports = router;