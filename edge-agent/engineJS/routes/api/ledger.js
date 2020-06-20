var express = require('express');
var router = express.Router();
var passport = require('passport')
const indy = require('../../indy/index.js');


// Send did to the ledger with a specific role
router.post('/send-nym', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let { did, newDid, newVerKey, role } = req.body
    if(role === 'COMMON_USER') role = null
    const nym = await indy.ledger.sendNym(did, newDid, newVerKey, role);
    const didDoc = await indy.ledger.createNymDocument(newDid, newVerKey);
  
    res.status(200).send({did: nym, role: role, didDoc:didDoc})
});
  
  
// Get did from the ledger
router.get('/get-nym', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let getDidResponse = await indy.ledger.getNym(req.query.did);
  
    res.status(200).send({did: getDidResponse.result.data})
});
  
  
// Create schema, store it and send it to the ledger
router.post('/create-schema', passport.authenticate('jwt', {session: false}), async (req, res) => {
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
router.get('/get-schema', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let [id, schema] = await indy.ledger.getSchema(null, req.query.schemaId)
  
    res.status(200).send({id: id, schema: schema})
});
  
  
// Create credential definition, store it and send it to the ledger
router.post('/create-cred-def', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const { did, schemaId, supportRevocation } = req.body;
    console.log(req.body)
    const didParts = did.split(':')
    if(didParts.length !== 3){
      return res.status(400).send({message: "Invalid DID: incorrect format."})
    }
    if(didParts[1] !== 'mybc'){
      return res.status(400).send({message: "Invalid DID: wrong blockchain."})
    }
    let [credDefId, credDef] = await indy.issuer.createCredDef(did, schemaId, "TAG1", supportRevocation);
  
    res.status(200).send({credDefId: credDefId, credDef:credDef})
});
  
  
// Get credential definition from the ledger
router.get('/get-cred-def', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let [id, credDef] = await indy.ledger.getCredDef(null, req.query.credDefId)
  
    res.status(200).send({id: id, credDef: credDef})
});

module.exports = router;