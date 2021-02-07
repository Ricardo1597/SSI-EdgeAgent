import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../../config';

import { connect } from 'react-redux';

function ConnectionActions({
  accessToken,
  connection,
  updateConnection,
  enqueueSnackbar,
  closeSnackbar,
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

  const acceptInvitation = (connectionId) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/connections/accept-invitation`,
        {
          id: connectionId,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { connection } }) => {
        console.log(connection);
        updateConnection(connection);
        showSnackbarVariant('Connection invitation accepted.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error accepting connection invitation. Please try again.', 'error');
      });
  };

  const rejectInvitation = (connectionId) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/connections/reject-invitation`,
        {
          id: connectionId,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { connection } }) => {
        console.log(connection);
        updateConnection(connection);
        showSnackbarVariant('Connection invitation rejected!', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error rejecting connection invitation. Please try again.', 'error');
      });
  };

  const acceptRequest = (connectionId) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/connections/accept-request`,
        {
          id: connectionId,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { connection } }) => {
        console.log(connection);
        updateConnection(connection);
        showSnackbarVariant('Connection request sent.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error sending connection request. Please try again.', 'error');
      });
  };

  const rejectRequest = (connectionId) => {
    const jwt = accessToken;
    axios
      .post(
        `${config.endpoint}/api/connections/reject-request`,
        {
          id: connectionId,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { connection } }) => {
        console.log(connection);
        updateConnection(connection);
        showSnackbarVariant('Connection request rejected.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error rejecting connection request. Please try again.', 'error');
      });
  };

  const deleteConnection = (id) => {
    const jwt = accessToken;

    axios
      .delete(`${config.endpoint}/api/connections/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then(({ data: { connection } }) => {
        console.log(connection);
        updateConnection(connection);
        showSnackbarVariant('Connection deleted.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error deleting connection. Please try again.', 'error');
      });
  };

  const { id, state, initiator } = connection;

  console.log('No conn actions:', connection);

  if (state === 'error') {
    return (
      <Button size="small" color="primary" onClick={() => deleteConnection(id)}>
        Remove Connection
      </Button>
    );
  } else if (state === 'complete') {
    return (
      <div>
        <Button size="small" color="primary" onClick={() => alert('Offer Credential', id)}>
          Offer Credential
        </Button>
        <Button size="small" color="primary" onClick={() => alert('Request Presentation', id)}>
          Request Presentation
        </Button>
      </div>
    );
  } else if (initiator === 'external') {
    switch (state) {
      case 'invited':
        return (
          <div>
            <Button size="small" color="primary" onClick={() => acceptInvitation(id)}>
              Accept Invitation
            </Button>
            <Button size="small" color="primary" onClick={() => rejectInvitation(id)}>
              Reject Invitation
            </Button>
          </div>
        );
      default:
        return null;
    }
  } else {
    switch (state) {
      case 'requested':
        return (
          <div>
            <Button size="small" color="primary" onClick={() => acceptRequest(id)}>
              Accept Request
            </Button>
            <Button size="small" color="primary" onClick={() => rejectRequest(id)}>
              Reject Request
            </Button>
          </div>
        );
      default:
        return null;
    }
  }
}

// Prop types
ConnectionActions.propTypes = {
  connection: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withSnackbar(ConnectionActions));
