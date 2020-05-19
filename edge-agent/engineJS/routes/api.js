var express = require('express');
var router = express.Router();
//const indy = require('../../indy/index');
var passport = require('passport')
const sdk = require('indy-sdk');
const indy = require('../indy/index.js');



// Create and store the DID in the given wallet
router.post('/createDID', passport.authenticate('jwt', {session: false}), async (req, res) => {  
  const { seed } = req.body;
  seedObj = (seed !== '') ? {'seed': seed} : null

  let [newDID,] = await indy.did.createDid(seedObj);
  console.log('DID created: ', newDID);


  let dids = await sdk.listMyDidsWithMeta(await indy.wallet.get());
  console.log('List of DIDs: ', dids);

  dids = await Promise.all(dids.map(async (did) => {    
    let getDidResponse = await indy.did.getNym(did.did);
    let didInfo = JSON.parse(getDidResponse.result.data) 

    did.role = (didInfo ? didInfo.role : "no role");

    return did;
  }))

  res.status(200).send({dids: dids});
});


// Send did to the ledger with a specific role
router.post('/sendNym', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let { did, newDid, newVerKey, role } = req.body
  if(role === 'COMMON_USER') role = null
  await indy.did.sendNym(did, newDid, newVerKey, role);

  res.status(200).send({did: newDid, role: role})
});


// Get did from the ledger
router.get('/getNym', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let getDidResponse = await indy.did.getNym(req.query.did);

  res.status(200).send({did: getDidResponse.result.data})
});


// Create schema, store it and send it to the ledger
router.post('/createSchema', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const { did, name, version, attributes } = req.body
  let [id, schema] = await indy.issuer.createSchema(did, name, version, attributes);

  res.status(200).send({id: id, schema:schema})
});


// Get schema from the ledger
router.get('/getSchema', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let [id, schema] = await indy.ledger.getSchema(null, req.query.schemaId)

  res.status(200).send({id: id, schema: schema})
});


// Create credential definition, store it and send it to the ledger
router.post('/createCredDef', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const { did, schemaId } = req.body
  let [credDefId, credDef] = await indy.issuer.createCredDef(did, schemaId, "TAG1");

  res.status(200).send({credDefId: credDefId, credDef:credDef})
});


// Get credential definition from the ledger
router.get('/getCredDef', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let [id, credDef] = await indy.ledger.getCredDef(null, req.query.credDefId)

  res.status(200).send({id: id, credDef: credDef})
});


// Get connection by id
router.get('/connection/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let connection = await indy.connections.getConnection(req.params.id)

  res.status(200).send({connection})
});


// Get all connections
router.get('/connections', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let connections = await indy.connections.getAllConnections()

  res.status(200).send({connections})
});


// Create connection invitation
router.post('/create_invitation', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const invitation = await indy.connections.createInvitation(req.body.alias);
  if (!invitation) {
    throw new Error('Error while creating invitation.');
  }
  res.status(200).send({invitation})
});


// Receive connection invitation
router.post('/receive_invitation', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const connection = await indy.connections.receiveInvitation(req.body.alias, req.body.invitation, req.body.accept || false);

  res.status(200).send({connection})
});


// Accept connection invitation
router.post('/accept_invitation', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const connection = await indy.connections.acceptInvitationAndSendRequest(req.body.id);

  res.status(200).send({connection})
});


// Accept connection request
router.post('/accept_request', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const connection = await indy.connections.createAndSendResponse(req.body.id);

  res.status(200).send(connection)
});


// Get all credentials
router.get('/credentials', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let credentials = await indy.wallet.getCredentials();

  res.status(200).send({credentials});
});


// Get credential exchange record by id
router.get('/credential_exchange/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let record = await indy.credentialExchange.getCredentialExchangeRecord(req.params.id);

  res.status(200).send({record});
});


// Get all credential exchange records
router.get('/credential_exchange', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let records = await indy.credentialExchange.getAllCredentialExchangeRecords();

  res.status(200).send({records});
});


// Remove credential exchange record by id
router.delete('/credential_exchange/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let record = await indy.credentialExchange.removeCredentialExchangeRecord(req.params.id);

  res.status(200).send({record});
});


// Holder send credential exchange proposal
router.post('/send_credential_proposal', passport.authenticate('jwt', {session: false}), async function (req, res) {

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
router.post('/send_credential_offer', passport.authenticate('jwt', {session: false}), async function (req, res) {
  const [record, messageSent] = await indy.credentialExchange.exchangeStartAtOffer(
    req.body.connectionId,
    req.body.comment,
    req.body.credAttributes,
    req.body.credDefId,
  );
  res.status(200).send({record, messageSent});
});


// Issuer send credential exchange offer
router.post('/:id/send_credential_offer', passport.authenticate('jwt', {session: false}), async function (req, res) {
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
router.post('/:id/send_credential_request', passport.authenticate('jwt', {session: false}), async function (req, res) {
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



// Get presentation exchange record by id
router.get('/presentation_exchange/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let record = await indy.presentationExchange.getPresentationExchangeRecord(req.params.id);

  res.status(200).send({record});
});


// Get all presentation exchange records
router.get('/presentation_exchange', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let records = await indy.presentationExchange.getAllPresentationExchangeRecords();

  res.status(200).send({records});
});


// Remove presentation exchange record by id
router.delete('/presentation_exchange/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let record = await indy.presentationExchange.removePresentationExchangeRecord(req.params.id);

  res.status(200).send({record});
});

// Holder send presentation exchange proposal
router.post('/send_presentation_proposal', passport.authenticate('jwt', {session: false}), async function (req, res) {

  const [record, messageSent] = await indy.presentationExchange.proverCreateAndSendProposal(
    req.body.connectionId, 
    req.body.comment, 
    req.body.presentationPreview
  );
  res.status(200).send({record, messageSent});
});


// Issuer send independent presentation exchange request
router.post('/send_presentation_request', passport.authenticate('jwt', {session: false}), async function (req, res) {
  // Create presentation exchange record
  let presentationExchangeRecord = indy.presentationExchange.verifierCreatePresentationExchangeRecord(req.body.connectionId)

  const [record, messageSent] = await indy.presentationExchange.verifierCreateAndSendRequest(
    presentationExchangeRecord,
    req.body.comment,
    req.body.presentationRequest,
  );

  res.status(200).send({record, messageSent});
});


// Issuer send presentation exchange request in response to a previous proposal
router.post('/:id/send_presentation_request', passport.authenticate('jwt', {session: false}), async function (req, res) {
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
});


// Holder send presentation exchange proposal
router.post('/:id/send_presentation', passport.authenticate('jwt', {session: false}), async function (req, res) {
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
});


// Holder send presentation exchange proposal
router.post('/:id/verify_presentation', passport.authenticate('jwt', {session: false}), async function (req, res) {
  // Get presentation exchange record
  let presentationExchangeRecord = await indy.wallet.getWalletRecord(
    indy.recordTypes.RecordType.PresentationExchange, 
    req.params.id, 
    {}
  );

  const [record, messageSent] = await indy.presentationExchange.verifierVerifyPresentation(
    presentationExchangeRecord
  );
  res.status(200).send({record, messageSent});
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