import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../../config';

import { connect } from 'react-redux';

function RecordActions({
  enqueueSnackbar,
  closeSnackbar,
  accessToken,
  updateExchange,
  state,
  id,
  role,
}) {
  const showSnackbarVariant = (message, variant) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action,
    });
  };

  const action = (key) => (
    <Fragment>
      <Button
        style={{ color: 'white' }}
        onClick={() => {
          closeSnackbar(key);
        }}
      >
        <strong>Dismiss</strong>
      </Button>
    </Fragment>
  );

  const sendProposal = (recordId) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/${recordId}/send-proposal`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { record } }) => {
        console.log(record);
        updateExchange(record);
        showSnackbarVariant('Credential proposal sent.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error sending proposal. Please try again.', 'error');
      });
  };

  const acceptProposal = (recordId) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/${recordId}/send-offer`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { record } }) => {
        console.log(record);
        updateExchange(record);
        showSnackbarVariant('Credential offer sent.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error accepting proposal. Please try again.', 'error');
      });
  };

  const acceptOffer = (recordId) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/${recordId}/send-request`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { record } }) => {
        console.log(record);
        updateExchange(record);
        showSnackbarVariant('Credential request sent.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error accepting offer. Please try again.', 'error');
      });
  };

  const acceptRequest = (recordId) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/${recordId}/send-credential`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { record } }) => {
        console.log(record);
        updateExchange(record);
        showSnackbarVariant('Credential sent.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error accepting. Please try again.', 'error');
      });
  };

  const rejectExchange = (recordId, messageType) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/${recordId}/reject?messageType=${messageType}`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { record } }) => {
        console.log(record);
        updateExchange(record);
        showSnackbarVariant(`Credential ${messageType} rejected!`, 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant(`Error rejecting ${messageType}. Please try again.`, 'error');
      });
  };

  switch (state) {
    case 'init' && role === 'holder':
      return (
        <Button size="small" color="primary" onClick={() => sendProposal(id)}>
          Send Proposal
        </Button>
      );
    case 'init' && role === 'issuer':
      return (
        <Button size="small" color="primary" onClick={() => acceptProposal(id)}>
          Send Offer
        </Button>
      );
    case 'proposal_received':
      return (
        <div>
          <Button size="small" color="primary" onClick={() => acceptProposal(id)}>
            Accept Proposal
          </Button>
          <Button size="small" color="primary" onClick={() => rejectExchange(id, 'proposal')}>
            Reject Proposal
          </Button>
        </div>
      );
    case 'offer_received':
      return (
        <div>
          <Button size="small" color="primary" onClick={() => acceptOffer(id)}>
            Accept Offer
          </Button>
          <Button size="small" color="primary" onClick={() => rejectExchange(id, 'offer')}>
            Reject Offer
          </Button>
        </div>
      );
    case 'request_received':
      return (
        <div>
          <Button size="small" color="primary" onClick={() => acceptRequest(id)}>
            Accept Request
          </Button>
          <Button size="small" color="primary" onClick={() => rejectExchange(id, 'request')}>
            Reject Request
          </Button>
        </div>
      );
    default:
      return null;
  }
}

// Prop types
RecordActions.propTypes = {
  state: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withSnackbar(RecordActions));
