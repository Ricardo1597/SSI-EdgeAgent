var express = require('express');
var router = express.Router();
var passport = require('passport')
const indy = require('../../indy/index.js');
const tempDirectory = require('temp-dir');


  

// Get revocation registriy by revocation registry ID
router.get('/registry/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const record = await indy.revocation.searchRevocRegRecord({'revocRegId': req.query.id})

    res.status(200).send({record});
});


// Get revocation registriy by revocation registry ID
router.get('/registry/:id/tails-file', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const record = await indy.revocation.searchRevocRegRecord({'revocRegId': req.query.id});

    res.status(200).send({path: record.tailsLocalPath});
});


// Get all revocation registries created by this agent
router.get('/registries/created', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const { credDefId, state} = req.body;
    let config = {};
    if(credDefId) config['credDefId'] = credDefId;
    if(state) config['state'] = state;

    const records = await indy.revocation.searchRevocRegRecord(config, true);

    res.status(200).send({records});
});


// Get the current active revocation registry for a given revocation registry ID
router.get('/active-registry/:id', passport.authenticate('jwt', {session: false}), async (req, res) => {
    const record = await indy.revocation.searchRevocRegRecord(
        {'revocRegId': req.query.id, 'state': indy.revocation.RevocationRegistryState.Active}
    );

    res.status(200).send({record});
});


// Publish revocation registry in the ledger
router.post('/registry/:id/publish', passport.authenticate('jwt', {session: false}), async (req, res) => {
    
    try {
        await indy.revocation.publishRevocRegDef(req.query.id);
        await indy.revocation.publishRevocRegEntry(req.query.id);
    } catch(error) {
        console.log("Error while trying to publish revocation registry.")
        throw error;
    }

    res.status(200).send({revocRegId: req.query.id});
});

// Create revocation registry
router.post('/create-registry', passport.authenticate('jwt', {session: false}), async (req, res) => {
    let { credDefId, issuanceByDefault, maxCredNum } = req.body;

    // Extract issuer ID from credential definition ID
    const credDefParts = credDefId.split(':');
    let issuerDid = '';
    if(credDefParts.length === 9) { // creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:17:TAG1
        // did:mybc:EbP4aYNeTHL6q385GuVpRV
        issuerDid = credDefParts[2] + ':' + credDefParts[3] + ':' + credDefParts[4];
    } else if(credDefParts.length === 5) { // EbP4aYNeTHL6q385GuVpRV:3:CL:17:TAG1
        // EbP4aYNeTHL6q385GuVpRV
        issuerDid = credDefParts[0];
    }

    const [revocRegId, revocRegDef, revocRegEntry] = await indy.revocation.createAndStoreRevocReg(
        issuerDid,
        null,
        credDefId,
        '/tmp/indy_acme_tails',
        parseInt(maxCredNum),
        issuanceByDefault
    );

    res.status(200).send({revocRegId, revocRegDef, revocRegEntry});
});
  
  

module.exports = router;