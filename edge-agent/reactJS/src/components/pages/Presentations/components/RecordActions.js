import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../config';

import { connect } from 'react-redux';

function RecordActions({
  enqueueSnackbar,
  closeSnackbar,
  accessToken,
  changeTabs,
  updateExchange,
  state,
  id,
  role,
}) {
  const classes = useStyles();

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

  // const sendProposal = (recordId) => {
  //   const jwt = accessToken;
  //   axios
  //     .post(
  //       `${config.endpoint}/api/presentation-exchanges/${recordId}/send-proposal`,
  //       {},
  //       {
  //         headers: { Authorization: `Bearer ${jwt}` },
  //       }
  //     )
  //     .then(({ data: { record } }) => {
  //       console.log(record);
  //       updateExchange(record);
  //       showSnackbarVariant('Presentation proposal sent.', 'success');
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       showSnackbarVariant('Error sending presentation proposal. Please try again.', 'error');
  //     });
  // };

  const rejectExchange = (recordId, messageType) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/presentation-exchanges/${recordId}/reject?messageType=${messageType}`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
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
        <Button size="small" color="primary" onClick={(e) => changeTabs(e, 1, id)}>
          Send Proposal
        </Button>
      );
    case 'init' && role === 'verifier':
      return (
        <Button size="small" color="primary" onClick={(e) => changeTabs(e, 2, id)}>
          Send Request
        </Button>
      );
    case 'proposal_received':
      return (
        <div>
          <Button size="small" color="primary" onClick={(e) => changeTabs(e, 2, id)}>
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
          <Button size="small" color="primary" onClick={(e) => changeTabs(e, 3, id)}>
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

// Styles
const useStyles = makeStyles((theme) => ({
  button: {
    '&:focus': {
      outline: 'none',
    },
  },
}));

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withSnackbar(RecordActions));
