const uuid = require('uuid');

const MessageType = {
  ConnectionInvitation: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation',
  ConnectionRequest: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request',
  ConnectionResponse: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/response',
  ConnectionAck: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/ack',
  ForwardMessage: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/routing/1.0/forward',
};
exports.MessageType = MessageType;


exports.createInvitationMessage = (invitationDetails) => {
  return {
    '@type': MessageType.ConnectionInvitation,
    '@id': uuid(),
    did: invitationDetails.did,
    recipientKeys: invitationDetails.recipientKeys,
    serviceEndpoint: invitationDetails.serviceEndpoint,
    routingKeys: invitationDetails.routingKeys,
  };
}


exports.createConnectionRequestMessage = (did, didDoc) => {
  return {
    '@type': MessageType.ConnectionRequest,
    '@id': uuid(),
    connection: {
      did: did,
      did_doc: didDoc,
    },
  };
}

exports.createConnectionResponseMessage = (threadId, did, didDoc) => {
  return {
    '@type': MessageType.ConnectionResponse,
    '@id': uuid(),
    '~thread': {
      thid: threadId,
    },
    connection: {
      did: did,
      did_doc: didDoc,
    },
  };
}

exports.createAckMessage = (thid) => {
  return {
    '@type': MessageType.ConnectionAck,
    '@id': uuid(),
    status: 'OK',
    '~thread': {
      thid: thid,
    },
  };
}

exports.createForwardMessage = (to, msg) => {
  return {
      '@type': MessageType.ForwardMessage,
      to,
      msg,
  };
}
