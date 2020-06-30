var express = require('express');
var router = express.Router();
var passport = require('passport')
const indy = require('../../indy/index.js');


// Get all presentation exchange records
router.get('/', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    let records = await indy.presentationExchange.searchPresentationExchangeRecord({}, true);
    res.status(200).send({records});
  } catch(error) {
    console.log(error);
    res.status(400).send({error});
  }
});

// Get presentation exchange record by id
router.get('/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    let record = await indy.presentationExchange.getPresentationExchangeRecord(req.params.id);
    res.status(200).send({record});
  } catch(error) {
    console.log(error);
    res.status(400).send({error});
  }
});
  
// Remove presentation exchange record by id
router.delete('/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    await indy.presentationExchange.removePresentationExchangeRecord(req.params.id);
    res.status(200).send({id: req.params.id});
  } catch(error) {
    console.log(error);
    res.status(400).send({error});
  }
});
  
// Holder send presentation exchange proposal
router.post('/send-proposal', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    console.log(req.body)
    const [record, messageSent] = await indy.presentationExchange.proverCreateAndSendProposal(
      req.body.connectionId, 
      req.body.comment, 
      req.body.presentationPreview
    );
    res.status(200).send({record, messageSent});
  } catch(error) {
    console.log(error);
    res.status(400).send({error});
  }
});
  
  
// Issuer send independent presentation exchange request
router.post('/send-request', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    // Create presentation exchange record
    let presentationExchangeRecord = indy.presentationExchange.verifierCreatePresentationExchangeRecord(req.body.connectionId)
  
    const [record, messageSent] = await indy.presentationExchange.verifierCreateAndSendRequest(
      presentationExchangeRecord,
      req.body.comment,
      req.body.presentationRequest,
    );
  
    res.status(200).send({record, messageSent});
  
  } catch(error) {
    console.log(error);
    res.status(400).send({error});
  }
});
  
  
// Issuer send presentation exchange request in response to a previous proposal
router.post('/:id/send-request', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    // Get presentation exchange record
    let presentationExchangeRecord = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.PresentationExchange, 
      req.params.id, 
      {}
    );
  
    const [record, messageSent] = await indy.presentationExchange.verifierCreateAndSendRequest(
      presentationExchangeRecord,
      req.body.comment,
      req.body.presentationRequest,
    );
  
    res.status(200).send({record, messageSent});

  } catch(error) {
    console.log(error);
    res.status(400).send({error});
  }
});
  
  
// Holder send presentation exchange proposal
router.post('/:id/send-presentation', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    // Get presentation exchange record
    let presentationExchangeRecord = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.PresentationExchange, 
      req.params.id, 
      {}
    );
  
    const [record, messageSent] = await indy.presentationExchange.proverCreateAndSendPresentation(
      presentationExchangeRecord, 
      req.body.requestedCredentials
    );
    res.status(200).send({record, messageSent});

  } catch(error) {
    console.log(error);
    res.status(400).send({error});
  }
});
  
  
// Holder send presentation exchange proposal
router.post('/:id/verify-presentation', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    // Get presentation exchange record
    let presentationExchangeRecord = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.PresentationExchange, 
      req.params.id, 
      {}
    );
  
    const [verified, record, messageSent] = await indy.presentationExchange.verifierVerifyPresentation(
      presentationExchangeRecord
    );
    res.status(200).send({verified, record, messageSent});

  } catch(error) {
    console.log(error);
    res.status(400).send({error});
  }
});


// Handle presentation exchange rejections
router.post('/:id/reject', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
  // Get presentation exchange record
  let presentationExchangeRecord = await indy.wallet.getWalletRecord(
    indy.recordTypes.RecordType.PresentationExchange, 
    req.params.id, 
    {}
  );

  let rejectError = "";
  switch(req.query.messageType) {
    case "proposal":
      rejectError = indy.presentationExchange.RejectionErrors.Proposal;
      break;
    case "request":
      rejectError = indy.presentationExchange.RejectionErrors.Request;
      break;
    default:
      return res.status(404).send({message: "Message type not found"})
  }

  const [record, messageSent] = await indy.presentationExchange.rejectExchange(
    presentationExchangeRecord,
    rejectError
  );
  res.status(200).send({record, messageSent});

} catch(error) {
  console.log(error);
  res.status(400).send({error});
}
});


module.exports = router;