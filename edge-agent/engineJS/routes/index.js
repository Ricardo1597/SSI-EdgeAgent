var express = require('express');
var router = express.Router();
var passport = require('passport')
const indy = require('../indy/index.js');


/* GET home page. */
router.get('/', function(req, res) {
  res.send('index page');
});


/*
router.post('/issuer/send_credential_offer', passport.authenticate('jwt', {session: false}), async function (req, res) {
  await indy.credentials.sendOffer(req.body.their_relationship_did, req.body.cred_def_id, req.body.cred_data);
  res.redirect('/#issuing');
});

router.post('/credentials/accept_offer', passport.authenticate('jwt', {session: false}), async function(req, res) {
  let message = indy.store.messages.getMessage(req.body.messageId);
  indy.store.messages.deleteMessage(req.body.messageId);
  await indy.credentials.sendRequest(message.message.origin, message.message.message);
  res.redirect('/#messages');
});

router.post('/credentials/reject_offer', passport.authenticate('jwt', {session: false}), async function(req, res) {
  indy.store.messages.deleteMessage(req.body.messageId);
  res.redirect('/');
});

router.put('/connections/request', passport.authenticate('jwt', {session: false}), async function (req, res) {
  let name = req.body.name;
  let messageId = req.body.messageId;
  let message = indy.store.messages.getMessage(messageId);
  indy.store.messages.deleteMessage(messageId);
  await indy.connections.acceptRequest(name, message.message.message.endpointDid, message.message.message.did, message.message.message.nonce);
  res.redirect('/#relationships');
});

router.delete('/connections/request', passport.authenticate('jwt', {session: false}), async function (req, res) {
  // FIXME: Are we actually passing in the messageId yet?
  if (req.body.messageId) {
      indy.store.messages.deleteMessage(req.body.messageId);
  }
  res.redirect('/#relationships');
});

router.post('/messages/delete', passport.authenticate('jwt', {session: false}), function(req, res) {
  indy.store.messages.deleteMessage(req.body.messageId);
  res.redirect('/#messages');
});

router.post('/proofs/accept', passport.authenticate('jwt', {session: false}), async function(req, res) {
      await indy.proofs.acceptRequest(req.body.messageId);
      res.redirect('/#messages');
});

router.post('/proofs/send_request', passport.authenticate('jwt', {session: false}), async function(req, res) {
  let myDid = await indy.pairwise.getMyDid(req.body.their_relationship_did);
  await indy.proofs.sendRequest(myDid, req.body.their_relationship_did, req.body.request_entry);
  res.redirect('/#proofs');
});

router.post('/proofs/validate', passport.authenticate('jwt', {session: false}), async function(req, res) {
  try {
      let proof = req.body;
      if (await indy.proofs.validate(proof)) {
          res.status(200).send();
      } else {
          res.status(400).send();
      }
  } catch(err) {
      res.status(500).send();
  }
});*/


module.exports = router;
