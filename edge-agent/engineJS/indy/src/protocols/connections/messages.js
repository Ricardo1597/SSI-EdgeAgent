const uuid = require('uuid');

const MessageType = {
  ConnectionInvitation: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation',
  ConnectionRequest: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request',
  ConnectionResponse: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/response',
  ConnectionAck: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/ack',
  ForwardMessage: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/routing/1.0/forward',
  ProblemReport: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/problem-report',
};
exports.MessageType = MessageType;

const NewMessageType = {
  ConnectionInvitation: 'https://didcomm.org/connections/1.0/invitation',
  ConnectionRequest: 'https://didcomm.org/connections/1.0/request',
  ConnectionResponse: 'https://didcomm.org/connections/1.0/response',
  ConnectionAck: 'https://didcomm.org/connections/1.0/ack',
  ForwardMessage: 'https://didcomm.org/routing/1.0/forward',
  ProblemReport: 'https://didcomm.org/connections/1.0/problem-report',
};
exports.NewMessageType = NewMessageType;

exports.createInvitationMessage = (myDidDoc, label = null, isPublic = false) => {
  return isPublic
    ? {
        '@type': MessageType.ConnectionInvitation,
        '@id': uuid(),
        label: label,
        did: myDidDoc.id,
      }
    : {
        '@type': MessageType.ConnectionInvitation,
        '@id': uuid(),
        label: label,
        did: myDidDoc.id,
        recipientKeys: myDidDoc.service[0].recipientKeys,
        serviceEndpoint: myDidDoc.service[0].serviceEndpoint,
        routingKeys: myDidDoc.service[0].routingKeys,
      };
};

exports.createConnectionRequestMessage = (did, didDoc, pthid, label = null) => {
  const messageID = uuid();
  return {
    '@type': MessageType.ConnectionRequest,
    '@id': messageID,
    '~thread': {
      thid: messageID,
      pthid: pthid, // ID of the invitation
    },
    label: label,
    connection: {
      did: did,
      did_doc: didDoc,
    },
  };
};

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
};

exports.createAckMessage = (thid) => {
  return {
    '@type': MessageType.ConnectionAck,
    '@id': uuid(),
    status: 'OK',
    '~thread': {
      thid: thid,
    },
  };
};

exports.createForwardMessage = (to, msg) => {
  return {
    '@type': MessageType.ForwardMessage,
    to,
    msg,
  };
};
