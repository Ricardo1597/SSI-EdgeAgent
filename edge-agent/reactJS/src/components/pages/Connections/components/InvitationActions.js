import React from 'react'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios'
import config from '../../../../config'

import { connect } from 'react-redux';


function InvitationActions(props) {
    const classes = useStyles();


    const activateInvitation = invitationId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/connections/activate_invitation/${invitationId}`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res)
        })
        .catch(err => {
              console.error(err);
              alert('Error activating invitation. Please try again.');
        });
    }

    const deactivateInvitation = invitationId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/connections/deactivate_invitation/${invitationId}`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res)
        })
        .catch(err => {
              console.error(err);
              alert('Error deactivating invitation. Please try again.');
        });
    }

    
    const { invitationId, isActive} = props.invitation;

    return isActive ? (
        <Button size="small" color="primary" onClick={() => deactivateInvitation(invitationId)}>Deactivate Invitation</Button>
    ) : (
        <Button size="small" color="primary" onClick={() => activateInvitation(invitationId)}>Activate Invitation</Button>
    )
}

// Prop types
InvitationActions.propTypes = {
    invitation: PropTypes.object.isRequired
}


// Styles
const useStyles = makeStyles((theme) => ({
    button : {
        "&:focus": {
            outline:"none",
        }
    },    
}));


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(InvitationActions);



