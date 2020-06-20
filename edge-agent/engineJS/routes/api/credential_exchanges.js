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
  
  
// Holder sends credential exchange proposal
router.post('/send-proposal', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{
    const [record, messageSent] = await indy.credentialExchange.holderCreateAndSendProposal(
      req.body.connectionId, 
      req.body.comment, 
      req.body.credAttributes, 
      req.body.schemaId, 
      req.body.credDefId
    );
    res.status(200).send({record, messageSent});
  } catch(error) {
    console.log('Error sendind proposal: ', error)
    res.status(400).send({mesasge: "Error sendind proposal"})
  }
});
  

// Issuer accepts credential exchange proposal and sends credential exchange offer
router.post('/send-offer', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{  
    const [record, messageSent] = await indy.credentialExchange.exchangeStartAtOffer(
      req.body.connectionId,
      req.body.comment,
      req.body.credAttributes,
      req.body.credDefId,
    );
    return res.status(200).send({record, messageSent});
  } catch(error) {
    console.log('Error sendind offer: ', error)
    res.status(400).send({mesasge: "Error sendind offer"})
  }
});

  
// Issuer send credential exchange offer
router.post('/:id/send-offer', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{  
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
    return res.status(200).send({record, messageSent});
  } catch(error) {
    console.log('Error sendind offer: ', error)
    return res.status(400).send({mesasge: "Error sendind offer"})
  }
});
  
  
// Holder send credential exchange request
router.post('/:id/send-request', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{  
    // Get credential exchange record
    let credentialExchangeRecord = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.CredentialExchange, 
      req.params.id, 
      {}
    );
  
    const [record, messageSent] = await indy.credentialExchange.holderCreateAndSendRequest(
      credentialExchangeRecord
    );
    return res.status(200).send({record, messageSent});
  } catch(error) {
    console.log('Error sendind proposal: ', error)
    res.status(400).send({mesasge: "Error sendind proposal"})
  }
});
  

// Issuer send credential exchange credential
router.post('/:id/send-credential', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{
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
  } catch(error) {
    console.log('Error sendind credential: ', error)
    res.status(400).send({mesasge: "Error sendind credential"})
  }
});
  
  
// Issuer revoke credential
router.post('/revoke', passport.authenticate('jwt', {session: false}), async function (req, res) {
    const { revocRegId, credRevId, publish } = req.body;
    try{
      invalidCredRevIds = await indy.credentialExchange.revokeCredential(revocRegId, credRevId, publish);
      res.status(200).send({ok: true, invalidCredRevIds});
    } catch(error) {
      console.log('Error revoking credential: ', error)
      res.status(400).send({mesasge: "Error revoking credential"})
    }
});

  
// Issuer publish all pending revocations
router.post('/publish-revocations', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{
    const [delta, invalidCredRevIds] = await indy.credentialExchange.publishPendingRevocations();
    res.status(200).send({delta, invalidCredRevIds});

  } catch(error) {
    console.log('Error publishing revocations: ', error)
    res.status(400).send({mesasge: "Error publishing revocations"})
  }
});

  
// Issuer publish all pending revocations from a given registry
router.post('/:id/publish-revocations', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{
    const [delta, invalidCredRevIds] = await indy.credentialExchange.publishPendingRevocations(req.query.id);
    res.status(200).send({record, messageSent});
  } catch(error) {
    console.log('Error publishing revocations: ', error)
    res.status(400).send({mesasge: "Error publishing revocations"})
  }
});


// Handle credential exchange rejections
router.post('/:id/reject', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{
    // Get credential exchange record
    let credentialExchangeRecord = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.CredentialExchange, 
      req.params.id, 
      {}
    );

    let rejectError = "";
    switch(req.query.messageType) {
      case "proposal":
        rejectError = indy.credentialExchange.RejectionErrors.Proposal;
        break;
      case "offer":
        rejectError = indy.credentialExchange.RejectionErrors.Offer;
      break;
      case "request":
        rejectError = indy.credentialExchange.RejectionErrors.Request;
        break;
      default:
        return res.status(404).send({message: "Message type not found"})
    }

    const [record, messageSent] = await indy.credentialExchange.rejectExchange(
      credentialExchangeRecord,
      rejectError
    );
    res.status(200).send({record, messageSent});
  } catch(error) {
    console.log('Error sendind rejection: ', error)
    res.status(400).send({mesasge: "Error sendind rejection"})
  }
});


module.exports = router;