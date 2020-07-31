import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../config';

import { connect } from 'react-redux';

function InvitationActions({ accessToken, invitation, enqueueSnackbar, closeSnackbar }) {
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

  const activateInvitation = (invitationId) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/connections/activate-invitation/${invitationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res);
        showSnackbarVariant('Invitation activated.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error activating invitation. Please try again.', 'error');
      });
  };

  const deactivateInvitation = (invitationId) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/connections/deactivate-invitation/${invitationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res);
        showSnackbarVariant('Invitation deactivated.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error deactivating invitation. Please try again.', 'error');
      });
  };

  const { invitationId, isActive } = invitation;

  return isActive ? (
    <Button size="small" color="primary" onClick={() => deactivateInvitation(invitationId)}>
      Deactivate Invitation
    </Button>
  ) : (
    <Button size="small" color="primary" onClick={() => activateInvitation(invitationId)}>
      Activate Invitation
    </Button>
  );
}

// Prop types
InvitationActions.propTypes = {
  invitation: PropTypes.object.isRequired,
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

export default connect(mapStateToProps)(withSnackbar(InvitationActions));
