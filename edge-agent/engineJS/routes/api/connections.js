var express = require('express');
var router = express.Router();
var passport = require('passport')
const indy = require('../../indy/index.js');


// Get all connections
router.get('/invitations', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let invitations = await indy.connections.getAllInvitations()
  
    res.status(200).send({invitations})
});
  
// Delete invitation by id
router.delete('/invitations/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await indy.connections.removeInvitation(req.params.id)
  
    res.status(200).send({id: req.params.id})
});
  
// Get all connections
router.get('/', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let connections = await indy.connections.getAllConnections()
  
    res.status(200).send({connections})
});
  
// Get connection by id
router.get('/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let connection = await indy.connections.getConnection(req.params.id)
  
    res.status(200).send({connection})
});
  
  
// Delete connection by id
router.delete('/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await indy.connections.removeConnection(req.params.id)
  
    res.status(200).send({id: req.params.id})
});
  
  
  
// Create connection invitation
router.post('/create_invitation', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const [myDid, myVerkey, myDidDoc] = await indy.connections.getDidAndDocument(req.body.public, req.body.did)
    const invitation = await indy.connections.createInvitation(myDid, myVerkey, myDidDoc, req.body.alias, req.body.public);
    if (!invitation) {
      throw new Error('Error while creating invitation.');
    }
    res.status(200).send({invitation})
});
  
// Activate connection invitation
router.post('/activate_invitation/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
router.post('/deactivate_invitation/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
  
// Reject connection request
router.post('/reject_request', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const connection = await indy.connections.rejectRequest(req.body.id);
  
    res.status(200).send(connection)
});
  
  
// Accept connection response
router.post('/accept_response', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const connection = await indy.connections.createAndSendResponse(req.body.id);
  
    res.status(200).send(connection)
});
  
// Reject connection response
router.post('/reject_response', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const connection = await indy.connections.rejectResponse(req.body.id);
  
    res.status(200).send(connection)
});

module.exports = router;