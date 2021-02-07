var express = require('express');
var router = express.Router();
var passport = require('passport');
const indy = require('../../indy/index.js');

// Get all presentation exchange records
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let records = await indy.presentationExchange.searchPresentationExchangeRecord({}, true);
    // Sort by last update date (descend)
    if (records) {
      records.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    }
    res.status(200).send({ records });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Get presentation exchange record by id
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let record = await indy.presentationExchange.getPresentationExchangeRecord(req.params.id);
    res.status(200).send({ record });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Remove presentation exchange record by id
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await indy.presentationExchange.removePresentationExchangeRecord(req.params.id);
    res.status(200).send({ id: req.params.id });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Holder send presentation exchange proposal
router.post(
  '/send-proposal',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let { connectionId, comment, presentationPreview } = req.body;
      presentationPreview['@type'] =
        'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/presentation-preview';
      console.log(req.body);
      const [record, messageSent] = await indy.presentationExchange.proverCreateAndSendProposal(
        connectionId,
        comment,
        presentationPreview
      );
      res.status(200).send({ record, messageSent });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Holder send presentation exchange proposal
router.post(
  '/:id/send-proposal',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Get presentation exchange record
      let presentationExchangeRecord = await indy.wallet.getWalletRecord(
        indy.recordTypes.RecordType.PresentationExchange,
        req.params.id,
        {}
      );

      const [record, messageSent] = await indy.presentationExchange.proverSendProposal(
        presentationExchangeRecord
      );

      res.status(200).send({ record, messageSent });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Issuer send independent presentation exchange request
router.post('/send-request', passport.authenticate('jwt', { session: false }), async (req, res) => {
  let { connectionId, comment, presentationRequest } = req.body;
  try {
    // Create presentation exchange record
    let presentationExchangeRecord = indy.presentationExchange.verifierCreatePresentationExchangeRecord(
      connectionId
    );

    const [record, messageSent] = await indy.presentationExchange.verifierCreateAndSendRequest(
      presentationExchangeRecord,
      comment,
      presentationRequest
    );

    res.status(200).send({ record, messageSent });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Issuer send presentation exchange request
router.post(
  '/:id/send-request',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let { comment, presentationRequest } = req.body;
    try {
      // Get presentation exchange record
      let presentationExchangeRecord = await indy.wallet.getWalletRecord(
        indy.recordTypes.RecordType.PresentationExchange,
        req.params.id,
        {}
      );

      const [record, messageSent] = await indy.presentationExchange.verifierCreateAndSendRequest(
        presentationExchangeRecord,
        comment,
        presentationRequest
      );

      res.status(200).send({ record, messageSent });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Holder create presentation
router.post(
  '/:id/create-presentation',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { requestedAttributes } = req.body;

    try {
      // Get presentation exchange record
      let presentationExchangeRecord = await indy.wallet.getWalletRecord(
        indy.recordTypes.RecordType.PresentationExchange,
        req.params.id,
        {}
      );

      // Convert the data to the correct format
      let reqAttributes = {};
      reqAttributes.requested_attributes = {};
      Object.entries(requestedAttributes.requested_attributes).map(([key, value]) => {
        reqAttributes.requested_attributes[key] = {
          cred_id: value,
          revealed: true,
        };
      });
      reqAttributes.requested_predicates = {};
      Object.entries(requestedAttributes.requested_predicates).map(([key, value]) => {
        reqAttributes.requested_predicates[key] = {
          cred_id: value,
        };
      });
      reqAttributes.self_attested_attributes = {};
      Object.entries(requestedAttributes.self_attested_attributes).map(([key, value]) => {
        reqAttributes.self_attested_attributes[key] = {
          cred_id: value,
          revealed: true,
        };
      });

      console.log('Requested attributes: ', reqAttributes);

      const record = await indy.presentationExchange.proverCreatePresentation(
        presentationExchangeRecord,
        reqAttributes
      );

      const valid = await indy.presentationExchange.verifyPresentation(
        record.presentationRequest,
        record.presentation
      );
      res.status(200).send({ record, valid });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Holder send presentation
router.post(
  '/:id/send-presentation',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Get presentation exchange record
      let presentationExchangeRecord = await indy.wallet.getWalletRecord(
        indy.recordTypes.RecordType.PresentationExchange,
        req.params.id,
        {}
      );

      const [record, messageSent] = await indy.presentationExchange.proverSendPresentation(
        presentationExchangeRecord
      );
      res.status(200).send({ record, messageSent });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Holder send presentation exchange proposal
router.post(
  '/:id/verify-presentation',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Get presentation exchange record
      let presentationExchangeRecord = await indy.wallet.getWalletRecord(
        indy.recordTypes.RecordType.PresentationExchange,
        req.params.id,
        {}
      );

      const [
        verified,
        record,
        messageSent,
      ] = await indy.presentationExchange.verifierVerifyPresentation(presentationExchangeRecord);
      res.status(200).send({ verified, record, messageSent });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Handle presentation exchange rejections
router.post('/:id/reject', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    // Get presentation exchange record
    let presentationExchangeRecord = await indy.wallet.getWalletRecord(
      indy.recordTypes.RecordType.PresentationExchange,
      req.params.id,
      {}
    );

    let rejectError = '';
    switch (req.query.messageType) {
      case 'proposal':
        rejectError = indy.presentationExchange.RejectionErrors.Proposal;
        break;
      case 'request':
        rejectError = indy.presentationExchange.RejectionErrors.Request;
        break;
      default:
        return res.status(404).send({ message: 'Message type not found' });
    }

    const [record, messageSent] = await indy.presentationExchange.rejectExchange(
      presentationExchangeRecord,
      rejectError
    );
    res.status(200).send({ record, messageSent });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

module.exports = router;
