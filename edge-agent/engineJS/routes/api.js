var express = require('express');
var router = express.Router();
//const indy = require('../../indy/index');
var passport = require('passport')
const sdk = require('indy-sdk');
const indy = require('../indy/index.js');



// Create and store the DID in the given wallet
router.post('/wallet/createDid', passport.authenticate('jwt', {session: false}), async (req, res) => {  
  const { seed } = req.body;

  options = {};
  options.method_name = 'mybc'; // to create did:mybc:<identifier>
  if(seed !== '') options.seed= seed; // to create from seed

  let [newDid, newVerKey] = await indy.did.createDid(options);

  // If did is a already a nym (created with seed), create and send his did document to the ledger
  if(JSON.parse((await indy.ledger.getNym(newDid)).result.data)) {
    await indy.ledger.createNymDocument(newDid, newVerKey);
  }

  let dids = await sdk.listMyDidsWithMeta(await indy.wallet.get());

  dids = await Promise.all(dids.map(async (did) => {    
    let didInfo = JSON.parse((await indy.ledger.getNym(did.did)).result.data) 
    did.role = (didInfo ? didInfo.role : "no role");
    return did;
  }))

  res.status(200).send({dids: dids});
});


// Send did to the ledger with a specific role
router.post('/ledger/sendNym', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let { did, newDid, newVerKey, role } = req.body
  if(role === 'COMMON_USER') role = null
  const nym = await indy.ledger.sendNym(did, newDid, newVerKey, role);
  const didDoc = await indy.ledger.createNymDocument(newDid, newVerKey);

  res.status(200).send({did: nym, role: role, didDoc:didDoc})
});


// Get did from the ledger
router.get('/ledger/getNym', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let getDidResponse = await indy.ledger.getNym(req.query.did);

  res.status(200).send({did: getDidResponse.result.data})
});


// Create schema, store it and send it to the ledger
router.post('/ledger/createSchema', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const { did, name, version, attributes } = req.body;
  const didParts = did.split(':')
  if(didParts.length !== 3){
    return res.status(400).send({message: "Invalid DID: incorrect format."})
  }
  if(didParts[1] !== 'mybc'){
    return res.status(400).send({message: "Invalid DID: wrong blockchain."})
  }
  let [id, schema] = await indy.issuer.createSchema(did, name, version, attributes);

  res.status(200).send({id: id, schema:schema})
});


// Get schema from the ledger
router.get('/ledger/getSchema', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let [id, schema] = await indy.ledger.getSchema(null, req.query.schemaId)

  res.status(200).send({id: id, schema: schema})
});


// Create credential definition, store it and send it to the ledger
router.post('/ledger/createCredDef', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const { did, schemaId } = req.body;
  const didParts = did.split(':')
  if(didParts.length !== 3){
    return res.status(400).send({message: "Invalid DID: incorrect format."})
  }
  if(didParts[1] !== 'mybc'){
    return res.status(400).send({message: "Invalid DID: wrong blockchain."})
  }
  let [credDefId, credDef] = await indy.issuer.createCredDef(did, schemaId, "TAG1");

  res.status(200).send({credDefId: credDefId, credDef:credDef})
});


// Get credential definition from the ledger
router.get('/ledger/getCredDef', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let [id, credDef] = await indy.ledger.getCredDef(null, req.query.credDefId)

  res.status(200).send({id: id, credDef: credDef})
});


// Get all connections
router.get('/connections/invitations', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let invitations = await indy.connections.getAllInvitations()

  res.status(200).send({invitations})
});

// Delete invitation by id
router.delete('/connections/invitations/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  await indy.connections.removeInvitation(req.params.id)

  res.status(200).send({id: req.params.id})
});

// Get connection by id
router.get('/connections/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let connection = await indy.connections.getConnection(req.params.id)

  res.status(200).send({connection})
});


// Get all connections
router.get('/connections', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let connections = await indy.connections.getAllConnections()

  res.status(200).send({connections})
});


// Delete connection by id
router.delete('/connections/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  await indy.connections.removeConnection(req.params.id)

  res.status(200).send({id: req.params.id})
});



// Create connection invitation
router.post('/connections/create_invitation', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const [myDid, myVerkey, myDidDoc] = await indy.connections.getDidAndDocument(req.body.public, req.body.did)
  const invitation = await indy.connections.createInvitation(myDid, myVerkey, myDidDoc, req.body.alias, req.body.public);
  if (!invitation) {
    throw new Error('Error while creating invitation.');
  }
  res.status(200).send({invitation})
});

// Activate connection invitation
router.post('/connections/activate_invitation/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let invitation = await indy.connections.getInvitation(req.params.id);

  invitation.isActive = true;

  await indy.wallet.updateWalletRecordValue(
    indy.recordTypes.RecordType.Invitation,
    invitation.invitationId,
    JSON.stringify(invitation)
  )

  res.status(200).send({invitation})
});

// Deactivate connection invitation
router.post('/connections/deactivate_invitation/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let invitation = await indy.connections.getInvitation(req.params.id);

  invitation.isActive = false;

  await indy.wallet.updateWalletRecordValue(
    indy.recordTypes.RecordType.Invitation,
    invitation.invitationId,
    JSON.stringify(invitation)
  )

  res.status(200).send({invitation})
});

// Receive connection invitation
router.post('/connections/receive_invitation', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const connection = await indy.connections.receiveInvitation(req.body.alias, req.body.invitation, req.body.accept || false);

  res.status(200).send({connection})
});


// Accept connection invitation
router.post('/connections/accept_invitation', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const connection = await indy.connections.acceptInvitationAndSendRequest(req.body.id);

  res.status(200).send({connection})
});


// Accept connection request
router.post('/connections/accept_request', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const connection = await indy.connections.createAndSendResponse(req.body.id);

  res.status(200).send(connection)
});

// Reject connection request
router.post('/connections/reject_request', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const connection = await indy.connections.rejectRequest(req.body.id);

  res.status(200).send(connection)
});


// Accept connection response
router.post('/connections/accept_response', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const connection = await indy.connections.createAndSendResponse(req.body.id);

  res.status(200).send(connection)
});

// Reject connection response
router.post('/connections/reject_response', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const connection = await indy.connections.rejectResponse(req.body.id);

  res.status(200).send(connection)
});


// Get all credentials
router.get('/credentials', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let credentials = await indy.wallet.getCredentials();

  res.status(200).send({credentials});
});


// Get credential exchange record by id
router.get('/credential_exchanges/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let record = await indy.credentialExchange.getCredentialExchangeRecord(req.params.id);

  res.status(200).send({record});
});


// Get all credential exchange records
router.get('/credential_exchanges', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let records = await indy.credentialExchange.getAllCredentialExchangeRecords();

  res.status(200).send({records});
});


// Remove credential exchange record by id
router.delete('/credential_exchanges/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  await indy.credentialExchange.removeCredentialExchangeRecord(req.params.id);

  res.status(200).send({id: req.params.id});
});


// Holder send credential exchange proposal
router.post('/credential_exchanges/send_proposal', passport.authenticate('jwt', {session: false}), async function (req, res) {

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
router.post('/credential_exchanges/send__offer', passport.authenticate('jwt', {session: false}), async function (req, res) {
  const [record, messageSent] = await indy.credentialExchange.exchangeStartAtOffer(
    req.body.connectionId,
    req.body.comment,
    req.body.credAttributes,
    req.body.credDefId,
  );
  res.status(200).send({record, messageSent});
});


// Issuer send credential exchange offer
router.post('/credential_exchanges/:id/send_offer', passport.authenticate('jwt', {session: false}), async function (req, res) {
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
router.post('/credential_exchanges/:id/send_request', passport.authenticate('jwt', {session: false}), async function (req, res) {
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
router.post('/credential_exchanges/:id/send_credential', passport.authenticate('jwt', {session: false}), async function (req, res) {
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
router.get('/presentation_exchanges/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let record = await indy.presentationExchange.getPresentationExchangeRecord(req.params.id);

  res.status(200).send({record});
});


// Get all presentation exchange records
router.get('/presentation_exchanges', passport.authenticate('jwt', {session: false}), async (req, res) => {
  let records = await indy.presentationExchange.getAllPresentationExchangeRecords();

  res.status(200).send({records});
});


// Remove presentation exchange record by id
router.delete('/presentation_exchanges/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
  await indy.presentationExchange.removePresentationExchangeRecord(req.params.id);

  res.status(200).send({id: req.params.id});
});

// Holder send presentation exchange proposal
router.post('/presentation_exchanges/send_proposal', passport.authenticate('jwt', {session: false}), async function (req, res) {
  console.log(req.body)
  const [record, messageSent] = await indy.presentationExchange.proverCreateAndSendProposal(
    req.body.connectionId, 
    req.body.comment, 
    req.body.presentationPreview
  );
  res.status(200).send({record, messageSent});
});


// Issuer send independent presentation exchange request
router.post('/presentation_exchanges/send_request', passport.authenticate('jwt', {session: false}), async function (req, res) {
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
router.post('/presentation_exchanges/:id/send_request', passport.authenticate('jwt', {session: false}), async function (req, res) {
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
router.post('/presentation_exchanges/:id/send_presentation', passport.authenticate('jwt', {session: false}), async function (req, res) {
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

  const [verified, record, messageSent] = await indy.presentationExchange.verifierVerifyPresentation(
    presentationExchangeRecord
  );
  res.status(200).send({verified, record, messageSent});
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