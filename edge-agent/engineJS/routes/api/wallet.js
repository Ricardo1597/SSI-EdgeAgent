var express = require('express');
var router = express.Router();
var passport = require('passport')
const sdk = require('indy-sdk');
const indy = require('../../indy/index.js');


// Create and store the DID in the given wallet
router.post('/create-did', passport.authenticate('jwt', {session: false}), async (req, res) => {  
    const { seed } = req.body;
  
    let options = {};
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

// Get all credentials
router.get('/credentials', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let credentials = await indy.wallet.getCredentials();
  
    res.status(200).send({credentials});
});

module.exports = router;