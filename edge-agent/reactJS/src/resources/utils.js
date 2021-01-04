exports.transformConnectionState = (state, initiator) => {
  if (initiator === 'external') {
    switch (state) {
      case 'init':
        return 'Initiated';
      case 'invited':
        return 'Invite received';
      case 'requested':
        return 'Request Sent';
      case 'responded':
        return 'Response Received';
      case 'complete':
        return 'Active';
      case 'error':
        return 'Terminated with an error';
      default:
        return '';
    }
  } else {
    switch (state) {
      case 'init':
        return 'Initiated';
      case 'invited':
        return 'Invite Sent';
      case 'requested':
        return 'Request Received';
      case 'responded':
        return 'Response Sent';
      case 'complete':
        return 'Active';
      case 'error':
        return 'Terminated with an error';
      default:
        return '';
    }
  }
};

exports.transformCredentialState = (state) => {
  switch (state) {
    case 'proposal_sent':
      return 'Proposal Sent';
    case 'proposal_received':
      return 'Proposal Received';
    case 'offer_sent':
      return 'Offer Sent';
    case 'offer_received':
      return 'Offer Received';
    case 'request_sent':
      return 'Request Sent';
    case 'request_received':
      return 'Request Received';
    case 'credential_issued':
      return 'Credential Issued';
    case 'credential_received':
      return 'Credential Received';
    case 'done':
      return 'Completed';
    case 'error':
      return 'Terminated with an error';
    default:
      return '';
  }
};

exports.transformPresentationState = (state) => {
  switch (state) {
    case 'proposal_sent':
      return 'Proposal Sent';
    case 'proposal_received':
      return 'Proposal Received';
    case 'request_sent':
      return 'Request Sent';
    case 'request_received':
      return 'Request Received';
    case 'presentation_sent':
      return 'Presentation Sent';
    case 'presentation_received':
      return 'Presentation Received';
    case 'presentation_verified':
      return 'Presentation Verified';
    case 'done':
      return 'Completed';
    case 'error':
      return 'Terminated with an error';
    default:
      return '';
  }
};
