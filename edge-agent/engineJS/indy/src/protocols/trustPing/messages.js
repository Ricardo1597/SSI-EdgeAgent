const uuid = require('uuid');

const MessageType = {
  TrustPing: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping',
  TrustPingResponse: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping_response',
};
exports.MessageType = MessageType;

const NewMessageType = {
  TrustPing: 'https://didcomm.org/trust_ping/1.0/ping',
  TrustPingResponse: 'https://didcomm.org/trust_ping/1.0/ping_response',
};
exports.NewMessageType = NewMessageType;

// {
//     "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping",
//     "@id": "518be002-de8e-456e-b3d5-8fe472477a86",
//     "~timing": {
//       "out_time": "2018-12-15 04:29:23Z",
//       "expires_time": "2018-12-15 05:29:23Z",
//       "delay_milli": 0
//     },
//     "comment": "Hi. Are you listening?",
//     "response_requested": true
// }
exports.createTrustPing = (responseRequested = true, comment = null) => {
  return {
    '@type': MessageType.TrustPing,
    '@id': uuid(),
    // "~timing": {
    //     "out_time": "2018-12-15 04:29:23Z",
    //     "expires_time": "2018-12-15 05:29:23Z",
    //     "delay_milli": 0
    // },
    comment: comment,
    response_requested: responseRequested,
  };
};

// {
//     "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping_response",
//     "@id": "e002518b-456e-b3d5-de8e-7a86fe472847",
//     "~thread": { "thid": "518be002-de8e-456e-b3d5-8fe472477a86" },
//     "~timing": { "in_time": "2018-12-15 04:29:28Z", "out_time": "2018-12-15 04:31:00Z"},
//     "comment": "Hi yourself. I'm here."
// }
exports.createTrustPingResponse = (thid, comment = null) => {
  return {
    '@type': MessageType.TrustPingResponse,
    '@id': uuid(),
    '~thread': {
      thid: thid,
    },
    // "~timing": {
    //     "in_time": "2018-12-15 04:29:28Z",
    //     "out_time": "2018-12-15 04:31:00Z"
    // },
    comment: comment,
  };
};
