const uuid = require('uuid');

const MessageType = {
  CredentialProposal: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/propose-credential',
  CredentialOffer: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/offer-credential',
  CredentialRequest: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/request-credential',
  CredentialIssuance: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/issue-credential',
  CredentialAck: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/ack',
  CredentialPreview: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/credential-preview',
  ProblemReport: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/issue-credential/1.0/problem-report',
  RevocationNotification: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/revocation_notification/1.0/revoke',
};
exports.MessageType = MessageType;

const NewMessageType = {
  CredentialProposal: 'https://didcomm.org/issue-credential/1.0/propose-credential',
  CredentialOffer: 'https://didcomm.org/issue-credential/1.0/offer-credential',
  CredentialRequest: 'https://didcomm.org/issue-credential/1.0/request-credential',
  CredentialIssuance: 'https://didcomm.org/issue-credential/1.0/issue-credential',
  CredentialAck: 'https://didcomm.org/issue-credential/1.0/ack',
  CredentialPreview: 'https://didcomm.org/issue-credential/1.0/credential-preview',
  ProblemReport: 'https://didcomm.org/issue-credential/1.0/problem-report',
  RevocationNotification: 'https://didcomm.org/revocation_notification/1.0/revoke',
};
exports.NewMessageType = NewMessageType;

exports.createCredentialProposal = (comment, schemaId, credentialPreview, credDefId, thid) => {
  let messageId = uuid();
  if (!thid) thid = messageId;
  return {
    '@type': MessageType.CredentialProposal,
    '@id': messageId,
    '~thread': {
      thid: thid,
    },
    comment: comment,
    credential_proposal: credentialPreview, // JSON-LD Object
    schema_id: schemaId,
    cred_def_id: credDefId,
  };
};

exports.createCredentialOffer = (comment, credentialPreview, data, thid) => {
  let messageId = uuid();
  if (!thid) thid = messageId;
  return {
    '@type': MessageType.CredentialOffer,
    '@id': messageId,
    comment: comment,
    credential_preview: credentialPreview, // JSON-LD Object
    '~thread': {
      thid: thid,
    },
    'offers~attach': [
      {
        '@id': 'libindy-cred-offer-0',
        'mime-type': 'application/json',
        data: {
          base64: data, // bytes for base64
        },
      },
    ],
  };
};

exports.createCredentialRequest = (data, thid) => {
  return {
    '@type': MessageType.CredentialRequest,
    '@id': uuid(),
    '~thread': {
      thid: thid,
    },
    'requests~attach': [
      {
        '@id': 'libindy-cred-req-0',
        'mime-type': 'application/json',
        data: {
          base64: data, // bytes for base64
        },
      },
    ],
  };
};

exports.createCredentialResponse = (data, thid) => {
  return {
    '@type': MessageType.CredentialIssuance,
    '@id': uuid(),
    '~thread': {
      thid: thid,
    },
    'credentials~attach': [
      {
        '@id': 'libindy-cred-0',
        'mime-type': 'application/json',
        data: {
          base64: data, // bytes for base64
        },
      },
    ],
  };
};

exports.createCredentialAckMessage = (thid) => {
  return {
    '@type': MessageType.CredentialAck,
    '@id': uuid(),
    status: 'OK',
    '~thread': {
      thid: thid,
    },
  };
};

exports.createCredentialRevokedMessage = (thid, comment) => {
  return {
    '@type': MessageType.RevocationNotification,
    '@id': uuid(),
    '~thread': {
      thid: thid,
    },
    comment: comment,
  };
};

exports.createCredentialPreview = (attributes) => {
  let res = {};
  res['@type'] = MessageType.CredentialPreview;
  res['attributes'] = [];

  attributes.forEach((attribute) => {
    res['attributes'].push({
      name: attribute['name'],
      'mime-type': attribute['mime-type'] ? attribute['mime-type'] : null,
      value: attribute['value'],
    });
  });

  return res;
};
