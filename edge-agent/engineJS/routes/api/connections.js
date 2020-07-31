var express = require('express');
var router = express.Router();
var passport = require('passport');
const indy = require('../../indy/index.js');

// Get all connections
router.get('/invitations', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let invitations = await indy.connections.getAllInvitations();
    // Sort by last update date (descend)
    if (invitations) {
      invitations.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    }
    res.status(200).send({ invitations });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Delete invitation by id
router.delete(
  '/invitations/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      await indy.connections.removeInvitation(req.params.id);
      res.status(200).send({ id: req.params.id });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Get all connections
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  //const query = req.query.onlyActive === 'true' ? {state: 'complete'} : {};
  try {
    let connections = await indy.connections.searchConnections({}, true);
    // Sort by last update date (descend)
    if (connections) {
      connections.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    }
    res.status(200).send({ connections });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Get connection by id
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let connection = await indy.connections.getConnection(req.params.id);
    res.status(200).send({ connection });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Delete connection by id
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await indy.connections.removeConnection(req.params.id);
    res.status(200).send({ id: req.params.id });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Create connection invitation
router.post(
  '/create-invitation',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { did, alias, isPublic, isMultiuse } = req.body;
    try {
      const [myDid, myVerkey, myDidDoc] = await indy.connections.getDidAndDocument(
        isPublic,
        'Invitation: ' + alias,
        did
      );
      const [invitation, url] = await indy.connections.createInvitation(
        myDid,
        myVerkey,
        myDidDoc,
        alias,
        isPublic,
        isMultiuse
      );
      if (!invitation) {
        throw new Error('Error while creating invitation.');
      }
      res.status(200).send({ invitation, url });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Activate connection invitation
router.post(
  '/activate-invitation/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let invitation = await indy.connections.getInvitation(req.params.id);

      invitation.isActive = true;

      await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.Invitation,
        invitation.invitationId,
        JSON.stringify(invitation)
      );

      res.status(200).send({ invitation });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Deactivate connection invitation
router.post(
  '/deactivate-invitation/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let invitation = await indy.connections.getInvitation(req.params.id);

      invitation.isActive = false;

      await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.Invitation,
        invitation.invitationId,
        JSON.stringify(invitation)
      );

      res.status(200).send({ invitation });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Receive connection invitation
router.post(
  '/receive-invitation',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const connection = await indy.connections.receiveInvitation(
        req.body.alias,
        req.body.invitation,
        req.body.accept || false
      );
      res.status(200).send({ connection });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Accept connection invitation
router.post(
  '/accept-invitation',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id, myLabel } = req.body;
    try {
      const connection = await indy.connections.acceptInvitationAndSendRequest(id, myLabel);
      res.status(200).send({ connection });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Reject connection invitation
router.post(
  '/reject-invitation',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const connection = await indy.connections.rejectInvitation(req.body.id);
      res.status(200).send({ connection });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Accept connection request
router.post(
  '/accept-request',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const connection = await indy.connections.createAndSendResponse(req.body.id);
      res.status(200).send({ connection });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Reject connection request
router.post(
  '/reject-request',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const rejectError = indy.connections.RejectionErrors.Request;
      const [connection, messageSent] = await indy.connections.rejectExchange(
        req.body.id,
        rejectError
      );
      res.status(200).send({ connection, messageSent });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Accept connection response
router.post(
  '/accept-response',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const [connection, messageSent] = await indy.connections.createAndSendResponse(req.body.id);
      res.status(200).send({ connection, messageSent });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Reject connection response
router.post(
  '/reject-response',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const rejectError = indy.connections.RejectionErrors.Response;
      const connection = await indy.connections.rejectExchange(req.body.id, rejectError);
      res.status(200).send({ connection });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

module.exports = router;
