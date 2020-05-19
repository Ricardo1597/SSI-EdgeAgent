'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
let endpointDid;
let endpointPublicVerkey;

exports.createDid = async (didInfoParam) => {
    let didInfo = didInfoParam || {};
    let [did, publicVerkey] = await sdk.createAndStoreMyDid(await indy.wallet.get(), didInfo);

    let didMeta = JSON.stringify({
        schemas: [],
        credential_definitions: []
    });

    await sdk.setDidMetadata(await indy.wallet.get(), did, didMeta);

    return [did, publicVerkey]
};


exports.sendNym = async (authDid, newDid, newVerKey, role) => {
    let nymRequest = await sdk.buildNymRequest(authDid, newDid, newVerKey, null, role);
    await sdk.signAndSubmitRequest(await indy.ledger.get(), await indy.wallet.get(), authDid, nymRequest);
};

exports.getNym = async (did) => {
    let getDidRequest = await sdk.buildGetNymRequest(null, did);
    return await sdk.submitRequest(await indy.ledger.get(), getDidRequest);
};


exports.getEndpointDid = async function() {
    if(!endpointDid) {
        let dids = await sdk.listMyDidsWithMeta(await indy.wallet.get());
        for (let didinfo of dids) {
            let meta = JSON.parse(didinfo.metadata);
            if (meta && meta.primary) {
                endpointDid = didinfo.did;
            }
        }
        if(!endpointDid) {
            await exports.createEndpointDid();
        }
    }
    return endpointDid;
};

exports.createEndpointDid = async function () {
    [endpointDid, endpointPublicVerkey] = await sdk.createAndStoreMyDid(await indy.wallet.get(), {});
    let didMeta = JSON.stringify({
        primary: true,
        schemas: [],
        credential_definitions: []
    });
    await sdk.setDidMetadata(await indy.wallet.get(), endpointDid, didMeta);
    await indy.crypto.createMasterSecret();
};

exports.setEndpointDidAttribute = async function (attribute, item) {
    let metadata = await sdk.getDidMetadata(await indy.wallet.get(), endpointDid);
    metadata = JSON.parse(metadata);
    metadata[attribute] = item;
    await sdk.setDidMetadata(await indy.wallet.get(), endpointDid, JSON.stringify(metadata));
};


exports.pushDidAttribute = async function (did, attribute, item) {
    let metadata = await sdk.getDidMetadata(await indy.wallet.get(), did);
    metadata = JSON.parse(metadata);
    if (!metadata[attribute]) {
        metadata[attribute] = [];
    }
    metadata[attribute].push(item);
    await sdk.setDidMetadata(await indy.wallet.get(), did, JSON.stringify(metadata));
};

exports.getEndpointDidAttribute = async function (attribute) {
    let metadata = await sdk.getDidMetadata(await indy.wallet.get(), endpointDid);
    metadata = JSON.parse(metadata);
    return metadata[attribute];
};

exports.getTheirEndpointDid = async function (theirDid) {
    let pairwise = await sdk.getPairwise(await indy.wallet.get(), theirDid);
    let metadata = JSON.parse(pairwise.metadata);
    return metadata.theirEndpointDid;
};

