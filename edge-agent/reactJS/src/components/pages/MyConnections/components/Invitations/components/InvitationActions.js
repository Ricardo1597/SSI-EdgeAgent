import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../../../config';

// Redux
import { useSelector } from 'react-redux';
import { getToken } from '../../../../../../redux/selectors';

function InvitationActions({
  invitation,
  setIsInvitationActive,
  removeInvitation,
  enqueueSnackbar,
  closeSnackbar,
}) {
  const accessToken = useSelector(getToken);

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
    axios
      .post(
        `${config.endpoint}/api/connections/activate-invitation/${invitationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((res) => {
        console.log(res);
        showSnackbarVariant('Invitation activated.', 'success');
        setIsInvitationActive(invitationId, true);
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error activating invitation. Please try again.', 'error');
      });
  };

  const deactivateInvitation = (invitationId) => {
    axios
      .post(
        `${config.endpoint}/api/connections/deactivate-invitation/${invitationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((res) => {
        console.log(res);
        showSnackbarVariant('Invitation deactivated.', 'success');
        setIsInvitationActive(invitationId, false);
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error deactivating invitation. Please try again.', 'error');
      });
  };

  const deleteInvitation = (id) => {
    // axios.delete(`${config.endpoint}/api/connections/invitations/${id}`, {
    //     headers: { Authorization: `Bearer ${accessToken}`}
    // })
    // .then(res => {
    //     console.log(res.data.id)
    // })
    // .catch(err => {
    //       console.error(err);
    //       alert('Error deleting invitation. Please try again.');
    // });
    console.log('Action not available yet!\nID: ', id);
  };

  const { invitationId, isActive } = invitation;

  return (
    <>
      {isActive ? (
        <Button size="small" color="primary" onClick={() => deactivateInvitation(invitationId)}>
          Deactivate Invitation
        </Button>
      ) : (
        <Button size="small" color="primary" onClick={() => activateInvitation(invitationId)}>
          Activate Invitation
        </Button>
      )}
      {/* <Button size="small" color="primary" onClick={() => deleteInvitation(invitationId)}>
        Remove Invitation
      </Button> */}
    </>
  );
}

// Prop types
InvitationActions.propTypes = {
  invitation: PropTypes.object.isRequired,
};

export default withSnackbar(InvitationActions);
