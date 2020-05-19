'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
const uuid = require('uuid');
const base64url = require('base64url');


exports.createMasterSecret = async function () {
    let masterSecretId = await indy.did.getEndpointDidAttribute('master_secret_id');
    if(!masterSecretId) {
        masterSecretId = uuid();
        await sdk.proverCreateMasterSecret(await indy.wallet.get(), masterSecretId);
        await indy.did.setEndpointDidAttribute('master_secret_id', masterSecretId);
    }
};

exports.getMasterSecretId = async function() {
    return await indy.did.getEndpointDidAttribute('master_secret_id');
};


exports.sign = async (wh, message, field, signer) => {
    const { [field]: data, ...originalMessage } = message;
  
    const dataBuffer = Buffer.concat([this.timestamp(), Buffer.from(JSON.stringify(data), 'utf8')]);
    const signatureBuffer = await sdk.cryptoSign(wh, signer, dataBuffer);
    const signedMessage = {
      // TypeScript is not able to infer mandatory type and id attribute, so we have to write it specifically.
      '@type': message['@type'],
      '@id': message['@id'],
      ...originalMessage,
      [`${field}~sig`]: {
        '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/signature/1.0/ed25519Sha512_single',
        signature: base64url.encode(signatureBuffer),
        sig_data: base64url.encode(dataBuffer),
        signer: signer,
      },
    };
  
    return signedMessage;
  }
  
  
  exports.verify = async (message, field) => {
    const { [`${field}~sig`]: data, ...signedMessage } = message;
  
    const signerVerkey = data.signer;
    // first 8 bytes are for 64 bit integer from unix epoch
    const signedData = base64url.toBuffer(data.sig_data);
    const signature = base64url.toBuffer(data.signature);
  
    console.log(signerVerkey);
    console.log(signedData);
    console.log(signature);

    // check signature
    const valid = await sdk.cryptoVerify(signerVerkey, signedData, signature);
  
    if (!valid) {
      throw new Error('Signature is not valid!');
    }
  
    const originalMessage = {
      // TypeScript is not able to infer mandatory type and id attribute, so we have to write it specifically.
      '@type': message['@type'],
      '@id': message['@id'],
      ...signedMessage,
      [`${field}`]: JSON.parse(signedData.slice(8).toString('utf-8')),
    };
  
    return originalMessage;
  }
  


exports.timestamp = () => {
    let time = Date.now();
    const bytes = [];
    for (let i = 0; i < 8; i++) {
      const byte = time & 0xff;
      bytes.push(byte);
      time = (time - byte) / 256; // Javascript right shift (>>>) only works on 32 bit integers
    }
    return Uint8Array.from(bytes).reverse();
}
  