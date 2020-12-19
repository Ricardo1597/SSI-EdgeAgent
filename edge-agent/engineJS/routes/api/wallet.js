var express = require('express');
var router = express.Router();
var passport = require('passport');
const sdk = require('indy-sdk');
const indy = require('../../indy/index.js');

// Create and store the DID in the given wallet
router.post('/create-did', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { seed, alias } = req.body;

  let options = {};
  options.method_name = 'mybc'; // to create did:mybc:<identifier>
  if (seed !== '') {
    options.seed = seed; // to create from seed
  }

  try {
    let [newDid, newVerKey] = await indy.did.createDid(alias, options);

    // If did is a already a nym (i.e. created with seed), create and send his did document to the ledger
    if (JSON.parse((await indy.ledger.getNym(newDid)).result.data)) {
      await indy.ledger.createNymDocument(newDid, newVerKey);
    }
    let did = await sdk.getMyDidWithMeta(await indy.wallet.get(), newDid);
    let didInfo = JSON.parse((await indy.ledger.getNym(did.did)).result.data);
    did.role = didInfo ? didInfo.role : 'no role';
    did.metadata = JSON.parse(did.metadata);

    res.status(200).send({ did: did });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Get did
router.get('/did/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let did = await sdk.getMyDidWithMeta(await indy.wallet.get(), req.params.id);
    let didInfo = JSON.parse((await indy.ledger.getNym(did.did)).result.data);
    did.role = didInfo ? didInfo.role : 'no role';
    did.metadata = JSON.parse(did.metadata);

    res.status(200).send({ did: did });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Get did document
router.get('/did-doc/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let didDoc = await indy.did.resolveDid(req.params.id);

    res.status(200).send({ didDoc });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Get all credentials
router.get('/credentials', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let credentials = await indy.wallet.searchCredentials({});
    console.log(credentials);
    res.status(200).send({ credentials });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Search matching credentials
router.get('/credentials', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const query = req.body.query; // change to individual filters?
  try {
    let credentials = await indy.wallet.searchCredentials(query);
    res.status(200).send({ credentials });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
});

// Search valid credentials for a given proof request
router.post(
  '/credentials-for-request',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    let { proofRequest } = req.body;
    console.log(proofRequest);
    try {
      // Generate nonce if none is passed
      if (!proofRequest.nonce) proofRequest.nonce = indy.presentationExchange.randomNonce();

      let credentials = await indy.wallet.searchCredentialsForProofRequest(req.body.proofRequest);
      res.status(200).send({ credentials });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error });
    }
  }
);

module.exports = router;
