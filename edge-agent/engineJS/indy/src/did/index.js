'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
let endpointDid;
let endpointPublicVerkey;


exports.createDid = async (didInfoParam) => {
    let didInfo = didInfoParam || {};
    let [did, publicVerkey] = await sdk.createAndStoreMyDid(await indy.wallet.get(), didInfo);

    let didMeta = JSON.stringify({
        primary: false,
        credential_definitions: [],
        schemas: []
    });

    await sdk.setDidMetadata(await indy.wallet.get(), did, didMeta);

    return [did, publicVerkey]
};


exports.setEndpointDid = async (did) => {
    // Change all primary dids to non-primary
    let dids = await sdk.listMyDidsWithMeta(await indy.wallet.get());
    for (let didinfo of dids) {
        let meta = JSON.parse(didinfo.metadata);
        if (meta && meta.primary === true) {
            await this.pushDidAttribute(didinfo.did, primary, false);
            break;
        }
    }
    
    // Set did to primary
    const verkey = sdk.keyForDid(await indy.ledger.get(), await indy.wallet.get(), did);
    endpointDid = did;
    endpointPublicVerkey = verkey;
    await this.pushDidAttribute(did, primary, true);
    return [endpointDid, endpointPublicVerkey];
};


exports.getEndpointDid = async () => {
    // look for a primary did
    if(!endpointDid) {
        let dids = await sdk.listMyDidsWithMeta(await indy.wallet.get());
        for (let didinfo of dids) {
            let meta = JSON.parse(didinfo.metadata);
            if (meta && meta.primary === true) {
                endpointDid = didinfo.did;
                break;
            }
        }
        if(!endpointDid) {
            throw new Error('No primary did found. Please create one.')
        }
    }
    return endpointDid;
};

exports.createEndpointDid = async () => {
    [endpointDid, endpointPublicVerkey] = await sdk.createAndStoreMyDid(await indy.wallet.get(), {});
    let didMeta = JSON.stringify({
        primary: true,
        schemas: [],
        credential_definitions: []
    });
    await sdk.setDidMetadata(await indy.wallet.get(), endpointDid, didMeta);;
};

exports.pushDidAttribute = async (did, attribute, item) => {
    let metadata = await sdk.getDidMetadata(await indy.wallet.get(), did);
    metadata = JSON.parse(metadata);
    metadata[attribute] = item;
    await sdk.setDidMetadata(await indy.wallet.get(), did, JSON.stringify(metadata));
};

exports.getDidAttribute = async (did, attribute) => {
    let metadata = await sdk.getDidMetadata(await indy.wallet.get(), did);
    metadata = JSON.parse(metadata);
    return metadata[attribute];
};

// exports.getTheirEndpointDid = async (theirDid) => {
//     let pairwise = await sdk.getPairwise(await indy.wallet.get(), theirDid);
//     let metadata = JSON.parse(pairwise.metadata);
//     return metadata.theirEndpointDid;
// };

exports.resolveDid = async (did) => {
    console.log(did);
    const didParts = did.split(':');
    if(didParts.length != 3) {
        throw new Error('Unable to resolve did: invalid did format.')
    }
    switch (didParts[1]) {
        case "peer":
            return await indy.didDoc.getLocalDidDocument(did);
        case "mybc":
            return await indy.ledger.getDidAttribute(null, did, null, 'did-document', null);
        default: 
            // use did universal resolver here for other blockchains
            throw new Error('Unable to resolve did: unknown ledger.')
    }
}

