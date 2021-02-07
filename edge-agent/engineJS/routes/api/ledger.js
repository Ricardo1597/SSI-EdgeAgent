var express = require('express');
var router = express.Router();
var passport = require('passport');
const indy = require('../../indy/index.js');
const sdk = require('indy-sdk');

// Send did to the ledger with a specific role
router.post('/send-nym', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let { did, newDid, newVerKey, role, isMyDid } = req.body;
    if (role === 'COMMON_USER') role = null;
    const nym = await indy.ledger.sendNym(did, newDid, newVerKey, role);
    let didDocument = null;
    if (isMyDid) {
      try {
        didDocument = await indy.ledger.createNymDocument(newDid, newVerKey);
      } catch (error) {
        if (error.indyCode === 212) {
          // WalletItemNotFound
          throw new Error(
            "Server error: You can't create a did document for a did that does not belong you"
          );
        } else {
          throw error;
        }
      }
    }

    res.status(200).send({ did: nym, role, didDocument });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Get did from the ledger
router.get('/get-nym', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const did = await indy.ledger.getNym(req.query.did);

    const didDocument = await indy.ledger.getDidAttribute(
      null,
      req.query.did,
      null,
      'did-document',
      null
    );

    res.status(200).send({ did, didDocument });
  } catch (error) {
    res.status(400).send({ error });
  }
});

// Create schema, store it and send it to the ledger
router.post(
  '/create-schema',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { did, name, version, attributes } = req.body;
    const didParts = did.split(':');
    if (didParts.length !== 3) {
      return res.status(400).send({ message: 'Invalid DID: incorrect format.' });
    }
    if (didParts[1] !== 'mybc') {
      return res.status(400).send({ message: 'Invalid DID: wrong blockchain.' });
    }
    try {
      let [id, schema] = await indy.issuer.createSchema(did, name, version, attributes);
      res.status(200).send({ id: id, schema: schema });
    } catch (error) {
      if (error.indyCode === 307) {
        // PoolLedgerTimeout
        res.status(404).send({ message: 'No permission to create schemas in the ledger.' });
      } else {
        res.status(400).send({ error });
      }
    }
  }
);

// Get schema from the ledger
router.get('/schema', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { schemaId } = req.query;
  try {
    let id = null;
    let schema = null;
    if (isNaN(schemaId)) {
      [id, schema] = await indy.ledger.getSchema(null, req.query.schemaId);
    } else {
      [id, schema] = await indy.ledger.getSchemaBySeqNo(null, null, parseInt(schemaId));
    }
    res.status(200).send({ id: id, schema: schema });
  } catch (error) {
    res.status(400).send({ error });
  }
});

// Create credential definition, store it and send it to the ledger
router.post(
  '/create-cred-def',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { did, schemaId, supportRevocation } = req.body;
    console.log(req.body);
    const didParts = did.split(':');
    if (didParts.length !== 3) {
      return res.status(400).send({ message: 'Invalid DID: incorrect format.' });
    }
    if (didParts[1] !== 'mybc') {
      return res.status(400).send({ message: 'Invalid DID: wrong blockchain.' });
    }

    try {
      let [credDefId, credDef] = await indy.issuer.createCredDef(
        did,
        schemaId,
        null, // Pass null to use uuid()
        supportRevocation
      );
      res.status(200).send({ credDefId: credDefId, credDef: credDef });
    } catch (error) {
      if (error.indyCode === 307) {
        // PoolLedgerTimeout
        res.status(404).send({ message: 'No permission to create schemas in the ledger.' });
      } else {
        res.status(400).send({ error });
      }
    }
  }
);

// Get credential definition from the ledger
router.get('/cred-def', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let [id, credDef] = await indy.ledger.getCredDef(null, req.query.credDefId);
    res.status(200).send({ id: id, credDef: credDef });
  } catch (error) {
    res.status(400).send({ error });
  }
});

// Get credential definition from the ledger
router.get(
  '/cred-def-with-schema',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const credDefIdParts = req.query.credDefId.split(':');
      const schemaTxnNo = parseInt(credDefIdParts[credDefIdParts.length - 2]);
      const credDef = {
        id: req.query.credDefId,
        schema: (await indy.ledger.getSchemaBySeqNo(null, null, schemaTxnNo))[1],
      };
      res.status(200).send({ credDef: credDef });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Get all credential definitions from a issuer
router.get(
  '/cred-defs-for-cred-offer',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let dids = await sdk.listMyDidsWithMeta(await indy.wallet.get());

      let credDefs = (
        await Promise.all(
          dids
            .filter((did) => !did.did.startsWith('did:peer'))
            .map(async (did) => {
              let didCredDefs = JSON.parse(did.metadata).credential_definitions;

              return await Promise.all(
                didCredDefs.map(async (didCredDef) => {
                  return {
                    id: didCredDef.id,
                    schema: (
                      await indy.ledger.getSchemaBySeqNo(null, null, parseInt(didCredDef.schemaId))
                    )[1],
                  };
                })
              );
            })
        )
      ).flat();

      res.status(200).send({ credDefs });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Get credential definition from the ledger
router.get(
  '/revoc-reg-def/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let revocRefDef = await indy.ledger.getRevocRegDef(null, req.params.id);
      res.status(200).send({ revocRefDef: revocRefDef });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

// Get credential definition from the ledger
router.get(
  '/revoc-reg-delta/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      let revocRefDelta = await indy.ledger.getRevocRegDelta(
        null,
        req.params.id,
        req.query.from,
        req.query.to
      );
      res.status(200).send({ revocRefDelta: revocRefDelta });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

module.exports = router;
