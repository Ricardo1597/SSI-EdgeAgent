import React from 'react'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios'
import config from '../../../../config'

import { connect } from 'react-redux';


function PendingConnectionActions(props) {
    const classes = useStyles();


    const acceptInvitation = connectionId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/accept_invitation`, {
            id: connectionId
        }, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res)
            } else {
                const error = new Error(res.error);
                throw error;
            }
        })
        .catch(err => {
              console.error(err);
              alert('Error accepting connection. Please try again.');
        });
    }


    const acceptRequest = connectionId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/accept_request`, {
            id: connectionId
        }, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res)
            } else {
                const error = new Error(res.error);
                throw error;
            }
        })
        .catch(err => {
              console.error(err);
              alert('Error accepting connection. Please try again.');
        });
    }



    const acceptResponse = connectionId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/accept_response`, {
            id: connectionId
        }, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res)
            } else {
                const error = new Error(res.error);
                throw error;
            }
        })
        .catch(err => {
              console.error(err);
              alert('Error accepting connection. Please try again.');
        });
    }

    const { state, initiator, connectionId } = props.connection;

    if(initiator === "external") {
        switch(state) {
            case 'invited':
                return <Button size="small" color="primary" onClick={() => acceptInvitation(connectionId)}>Accept Invitation</Button>;
            case 'responded':
                return <Button size="small" color="primary" onClick={() => acceptResponse(connectionId)}>Accept Response</Button>;
            default:
                return null;
        }
    } else {
        switch(state) {
            case 'requested':
                return <Button size="small" color="primary" onClick={() => acceptRequest(connectionId)}>Accept Request</Button>;
            default:
                return null;
        }
    }
}

// Prop types
PendingConnectionActions.propTypes = {
    connection: PropTypes.object.isRequired
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
  
export default connect(mapStateToProps)(PendingConnectionActions);



