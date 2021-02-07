import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../../../config';

// Redux
import { useSelector } from 'react-redux';
import { getToken } from '../../../../../../redux/selectors';

function RecordActions({
  enqueueSnackbar,
  closeSnackbar,
  updateExchange,
  state,
  id,
  role,
  openProposePresentationDialog,
  openRequestPresentationDialog,
  openSendPresentationDialog,
}) {
  const accesstoken = useSelector(getToken);

  const showSnackbarVariant = (message, variant) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: (key) => (
        <>
          <Button
            style={{ color: 'white' }}
            onClick={() => {
              closeSnackbar(key);
            }}
          >
            <strong>Dismiss</strong>
          </Button>
        </>
      ),
    });
  };

  const rejectExchange = (recordId, messageType) => {
    axios
      .post(
        `${config.endpoint}/api/presentation-exchanges/${recordId}/reject?messageType=${messageType}`,
        {},
        {
          headers: { Authorization: `Bearer ${accesstoken}` },
        }
      )
      .then(({ data: { record } }) => {
        console.log(record);
        updateExchange(record);
        showSnackbarVariant(`Presentation ${messageType} rejected.`, 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant(`Error rejecting ${messageType}. Please try again.`, 'error');
      });
  };

  switch (state) {
    case 'init' && role === 'prover':
      return (
        <Button size="small" color="primary" onClick={openProposePresentationDialog}>
          Send Proposal
        </Button>
      );
    case 'init' && role === 'verifier':
      return (
        <Button size="small" color="primary" onClick={openRequestPresentationDialog}>
          Send Request
        </Button>
      );
    case 'proposal_received':
      return (
        <div>
          <Button size="small" color="primary" onClick={openRequestPresentationDialog}>
            Accept Proposal
          </Button>
          <Button size="small" color="primary" onClick={() => rejectExchange(id, 'proposal')}>
            Reject Proposal
          </Button>
        </div>
      );
    case 'request_received':
      return (
        <div>
          <Button size="small" color="primary" onClick={openSendPresentationDialog}>
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

export default withSnackbar(RecordActions);
