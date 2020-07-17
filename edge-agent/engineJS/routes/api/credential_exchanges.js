var express = require('express');
var router = express.Router();
var passport = require('passport')
const indy = require('../../indy/index.js');


// Get all credential exchange records
router.get('/', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
      let records = await indy.credentialExchange.searchCredentialExchangeRecord({}, true);
      res.status(200).send({records});
    } catch(error){
        res.status(400).send({error});
    }
});

  
// Get credential exchange record by id
router.get('/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
      let record = await indy.credentialExchange.getCredentialExchangeRecord(req.params.id)
      res.status(200).send({record});
    } catch(error){
        res.status(400).send({error});
    }
});
  
  
// Remove credential exchange record by id
router.delete('/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    try {
      await indy.credentialExchange.removeCredentialExchangeRecord(req.params.id)
      res.status(200).send({id: req.params.id});
    } catch(error){
        res.status(400).send({error});
    }
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
    console.log('Error sending proposal: ', error)
    res.status(400).send({error})
  }
});

// Holder sends credential exchange proposal
router.post('/:id/send-proposal', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{  
    // Get credential exchange record
    let credentialExchangeRecord = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.CredentialExchange, 
      req.params.id, 
      {}
    );
  
    const [record, messageSent] = await indy.credentialExchange.holderSendProposal(credentialExchangeRecord);
    return res.status(200).send({record, messageSent});

  } catch(error) {
    console.log('Error sending proposal: ', error);
    return res.status(400).send({error});
  }
});
  

// Issuer accepts credential exchange proposal and sends credential exchange offer
router.post('/send-offer', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{  
    const [record, messageSent] = await indy.credentialExchange.exchangeStartAtOffer(
      req.body.connectionId,
      req.body.comment,
      req.body.credAttributes,
      req.body.schemaId, 
      req.body.credDefId,
    );
    res.status(200).send({record, messageSent});
  } catch(error) {
    console.log('Error sending offer: ', error);
    res.status(400).send({error});
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
    console.log('Error sending offer: ', error);
    return res.status(400).send({error});
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
    console.log('Error sending proposal: ', error);
    res.status(400).send({error});
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
    console.log('Error sending credential: ', error);
    res.status(400).send({error});
  }
});
  
  
// Issuer revoke credential
router.post('/revoke', passport.authenticate('jwt', {session: false}), async function (req, res) {
    const { revocRegId, credRevId, publish } = req.body;
    try{
      invalidCredRevIds = await indy.credentialExchange.revokeCredential(revocRegId, credRevId, publish);
      res.status(200).send({ok: true, invalidCredRevIds});
    } catch(error) {
      console.log('Error revoking credential: ', error);
      res.status(400).send({error});
    }
});

  
// Issuer publish all pending revocations
router.post('/publish-revocations', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{
    const [delta, invalidCredRevIds] = await indy.credentialExchange.publishPendingRevocations();
    res.status(200).send({delta, invalidCredRevIds});

  } catch(error) {
    console.log('Error publishing revocations: ', error);
    res.status(400).send({error});
  }
});

  
// Issuer publish all pending revocations from a given registry
router.post('/:id/publish-revocations', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{
    const [delta, invalidCredRevIds] = await indy.credentialExchange.publishPendingRevocations(req.query.id);
    res.status(200).send({record, messageSent});
  } catch(error) {
    console.log('Error publishing revocations: ', error);
    res.status(400).send({error});
  }
});


// Issuer send credential exchange credential
router.post('/:id/send-revocation-notification', passport.authenticate('jwt', {session: false}), async function (req, res) {
  try{
    const [record, messageSent] = await indy.credentialExchange.sendRevocationNotification(
      req.params.id, 
      req.body.comment
    );
    res.status(200).send({record, messageSent});
  } catch(error) {
    console.log('Error sending revocation notification: ', error);
    res.status(400).send({error});
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
    console.log('Error sending rejection: ', error);
    res.status(400).send({error});
  }
});


module.exports = router;