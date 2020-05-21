'use strict';
const indy = require('../../index');
const config = require('../../../config');

exports.PublicKeyType = {
    RSA_SIG_2018: 'RsaVerificationKey2018|RsaSignatureAuthentication2018|publicKeyPem',
    ED25519_SIG_2018: 'Ed25519VerificationKey2018|Ed25519SignatureAuthentication2018|publicKeyBase58',
    EDDSA_SA_SIG_SECP256K1: 'Secp256k1VerificationKey2018|Secp256k1SignatureAuthenticationKey2018|publicKeyHex',
}


exports.createDidAndDidDoc = async (options) => {
    const [did, verkey] = await indy.did.createDid(options);
    const publicKey = indy.didDoc.createPublicKey(
        `${did}#1`, 
        indy.didDoc.PublicKeyType.ED25519_SIG_2018, 
        did, 
        verkey
    );
    const service = indy.didDoc.createService(
        `${did}#did-communication`, 
        config.endpoint, 
        [verkey], 
        [], 
        0, 
        'did-communication'
    );
    const auth = indy.didDoc.createAuthentication(publicKey);
    const didDoc = indy.didDoc.createDidDoc(did, [auth], [publicKey], [service]);

    return [did, verkey, didDoc]
}


exports.createDidDoc = (id, authentication, publicKey, service) => {
    return {
        '@context': 'https://w3id.org/did/v1',
        id: id,
        authentication: authentication,
        publicKey: publicKey,
        service: service,
    }
};

exports.createPublicKey = (id, type, controller, value) => {
    const [ver_type, auth_type, specifier] = type.split('|');
    return {
        id: id,
        type: ver_type,
        controller: controller,
        [specifier]: value,
    };
};

exports.createAuthentication = (publicKey, embed=false) => {
    return embed
        ? this.createPublicKey(publicKey.id, publicKey.type, publicKey.controller, publicKey.value)
        : publicKey.id;
};

exports.createService = (id, serviceEndpoint, recipientKeys, routingKeys, priority, type) => {
    let res = {
        id: id,
        type: type,
        priority: priority,
        serviceEndpoint: serviceEndpoint,
    };
    if(recipientKeys) res['recipientKeys'] = recipientKeys;
    if(routingKeys) res['routingKeys'] = routingKeys;

    return res;
};


exports.getLocalDidDocument = async (id) => {
    return await indy.wallet.getWalletRecord(
        indy.recordTypes.RecordType.DidDocument, 
        id, 
        {}
    );
}

exports.addLocalDidDocument = async (didDoc) => {
    try {
        return await indy.wallet.addWalletRecord(
            indy.recordTypes.RecordType.DidDocument, 
            didDoc.id, 
            JSON.stringify(didDoc),
            {}
        );
    } catch(error) {
        if(error.indyCode && error.indyCode === 213){
            console.log("Unable to add did document record. Wallet item already exists.");
        }
        throw error;
    }    
}

exports.updateLocalDidDocument = async (didDoc) => {
    return await indy.wallet.updateWalletRecordValue(
        indy.recordTypes.RecordType.DidDocument, 
        didDoc.id, 
        JSON.stringify(didDoc)
    );
}

exports.deleteLocalDidDocument = async (id) => {
    return await indy.wallet.deleteWalletRecord(
        indy.recordTypes.RecordType.DidDocument, 
        id
    );
}

// Replace publickKey.verkey with the correct field
// exports.getServiceVerkey = (didId, didDoc) => {
//     let verkey = null
//     for(let publicKey of didDoc.publicKey){
//         if(publicKey.id === didId){
//             verkey = publicKey.verkey
//         }
//     }
//     return verkey
// }

exports.serialize = function(doc) {
    return JSON.stringify(doc.toJSON());
}

exports.deserialize = function(doc){
    return JSON.parse(doc);
}
 

