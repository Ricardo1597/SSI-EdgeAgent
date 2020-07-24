import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios';
import config from '../../../../config';

import { connect } from 'react-redux';

function PendingConnectionActions(props) {
  const classes = useStyles();

  const acceptInvitation = (connectionId) => {
    const jwt = props.accessToken;
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
        props.updateConnection(connection);
        alert('Connection invitation accepted with success!');
      })
      .catch((err) => {
        console.error(err);
        alert('Error accepting connection. Please try again.');
      });
  };

  const rejectInvitation = (connectionId) => {
    const jwt = props.accessToken;
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
        props.updateConnection(connection);
        alert('Connection invitation rejected!');
      })
      .catch((err) => {
        console.error(err);
        alert('Error rejecting connection. Please try again.');
      });
  };

  const acceptRequest = (connectionId) => {
    const jwt = props.accessToken;
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
        props.updateConnection(connection);
        //alert("Connection request sent with success!");
      })
      .catch((err) => {
        console.error(err);
        alert('Error accepting connection. Please try again.');
      });
  };

  const rejectRequest = (connectionId) => {
    const jwt = props.accessToken;
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
        props.updateConnection(connection);
        alert('Connection request rejected!');
      })
      .catch((err) => {
        console.error(err);
        alert('Error rejection connection request. Please try again.');
      });
  };

  const deleteConnection = (id) => {
    const jwt = props.accessToken;

    axios
      .delete(`${config.endpoint}/api/connections/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then(({ data: { id } }) => {
        console.log(id);
        props.removeConnection(id);
      })
      .catch((err) => {
        console.error(err);
        alert('Error deleting connection. Please try again.');
      });
  };

  const { state, initiator, connectionId } = props.connection;

  if (state === 'error') {
    return (
      <Button size="small" color="primary" onClick={() => deleteConnection(connectionId)}>
        Remove Connection
      </Button>
    );
  } else if (initiator === 'external') {
    switch (state) {
      case 'invited':
        return (
          <div>
            <Button size="small" color="primary" onClick={() => acceptInvitation(connectionId)}>
              Accept Invitation
            </Button>
            <Button size="small" color="primary" onClick={() => rejectInvitation(connectionId)}>
              Reject Invitation
            </Button>
          </div>
        );
        {
          /*case 'responded':
                return <Button size="small" color="primary" onClick={() => acceptResponse(connectionId)}>Accept Response</Button>;*/
        }
      default:
        return null;
    }
  } else {
    switch (state) {
      case 'requested':
        return (
          <div>
            <Button size="small" color="primary" onClick={() => acceptRequest(connectionId)}>
              Accept Request
            </Button>
            <Button size="small" color="primary" onClick={() => rejectRequest(connectionId)}>
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
PendingConnectionActions.propTypes = {
  connection: PropTypes.object.isRequired,
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
    accessToken: state.accessToken,
  };
};

export default connect(mapStateToProps)(PendingConnectionActions);
