const uuid = require('uuid');


const MessageType = {
  PresentationProposal: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/propose-presentation',
  PresentationRequest: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/request-presentation',
  Presentation: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/presentation',
  PresentationAck: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/ack',
  PresentationPreview: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/presentation-preview',
  ProblemReport: 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/problem-report',
};
exports.MessageType = MessageType;

const NewMessageType = {
  PresentationProposal: 'https://didcomm.org/present-proof/1.0/propose-presentation',
  PresentationRequest: 'https://didcomm.org/present-proof/1.0/request-presentation',
  Presentation: 'https://didcomm.org/present-proof/1.0/presentation',
  PresentationAck: 'https://didcomm.org/present-proof/1.0/ack',
  PresentationPreview: 'https://didcomm.org/present-proof/1.0/presentation-preview',
  ProblemReport: 'https://didcomm.org/present-proof/1.0/problem-report',
};
exports.NewMessageType = NewMessageType;


exports.createPresentationProposal = (comment, presentationPreview) => {
  const messageId = uuid()
  return {
    "@type": MessageType.PresentationProposal,
    "@id": messageId,
    "comment": comment,
    '~thread': {
      thid: messageId,
    },
    "presentation_proposal": presentationPreview
  }
}


exports.createPresentationRequest = (comment, base64, thid) => {
  let messageId = uuid();
  if(!thid) thid = messageId;
  return {
    "@type": MessageType.PresentationRequest,
    "@id": messageId,
    "comment": comment,
    '~thread': {
      thid: thid,
    },
    "request_presentations~attach": [
      {
        "@id": "libindy-request-presentation-0",
        "mime-type": "application/json",
        data: {
          "base64": base64 // bytes for base64
        }
      }
    ]
  }
}


exports.createPresentation = (comment, base64, thid) => {
  return {
    "@type": MessageType.Presentation,
    "@id": uuid(),
    "comment": comment,
    '~thread': {
      thid: thid,
    },
    "presentations~attach": [
      {
        "@id": "libindy-presentation-0",
        "mime-type": "application/json",
        data: {
          "base64": base64 // bytes for base64
        }
      }
    ]
  }
}


exports.createPresentationAckMessage = (thid) => {
  return {
    '@type': MessageType.PresentationAck,
    '@id': uuid(),
    status: 'OK',
    '~thread': {
      thid: thid,
    },
  };
}
  

// exports.createPresentationPreview = (attributes, predicates) => {
//     let res = {}
//     res['@type'] = MessageType.PresentationPreview;
//     res['attributes'] = [];
//     res['predicates'] = [];
    
//     attributes.forEach(attribute => {
//         res['attributes'].push({
//             "name": attribute['name'],
//             "cred_def_id": attribute['cred_def_id']? attribute['cred_def_id'] : null,
//             "mime-type": attribute['mime-type']? attribute['mime-type'] : null,
//             "value": attribute['value'],
//             "referent": attribute['referent']? attribute['referent'] : null
//         })
//     });
    
//     predicates.forEach(predicate => {
//         res['predicates'].push({
//             "name": predicate['name'],
//             "cred_def_id": predicate['cred_def_id'],
//             "predicate": predicate['predicate'],
//             "treshold": predicate['treshold'],
//         })
//     });
    
//     return res;
// };

