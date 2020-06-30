var express = require('express');
var router = express.Router();
var passport = require('passport')
const sdk = require('indy-sdk');
const indy = require('../../indy/index.js');


// Create and store the DID in the given wallet
router.post('/create-did', passport.authenticate('jwt', {session: false}), async (req, res) => {  
    const { seed, alias } = req.body;
  
    let options = {};
    if(seed !== '') {
      options.method_name = 'mybc'; // to create did:mybc:<identifier>
      options.seed= seed; // to create from seed
    } else { // Probably this will never be used
      options.method_name = 'peer'; // to create did:peer:<identifier>
    }

    try {
      let [newDid, newVerKey] = await indy.did.createDid(alias, options);
    
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
    
    } catch(error) {
      res.status(400).send({error});
  }
});

// Get all credentials
router.get('/credentials', passport.authenticate('jwt', {session: false}), async (req, res) => {
  try {
    let credentials = await indy.wallet.getCredentials();
    let credentials2 = await indy.wallet.searchCredentials({});
    console.log(credentials);
    console.log(credentials2);
    res.status(200).send({credentials});
  } catch(error) {
    res.status(400).send({error});
  }
});

// Search matching credentials
router.get('/credentials', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const query = req.body.query // change to individual filters?
  try {
    let credentials = await indy.wallet.searchCredentials(query);
    res.status(200).send({credentials});
  } catch(error) {
    res.status(400).send({error});
  }
});

module.exports = router;