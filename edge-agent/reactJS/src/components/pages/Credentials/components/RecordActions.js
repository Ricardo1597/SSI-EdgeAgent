import React from 'react'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios'
import config from '../../../../config'

import { connect } from 'react-redux';


function RecordActions(props) {
    const classes = useStyles();


    const sendProposal = recordId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/credential-exchanges/${recordId}/send-proposal`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data)
        })
        .catch(err => {
              console.error(err);
              alert('Error sending proposal. Please try again.');
        });
    }

    const acceptProposal = recordId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/credential-exchanges/${recordId}/send-offer`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data)
        })
        .catch(err => {
              console.error(err);
              alert('Error accepting proposal. Please try again.');
        });
    }

    const acceptOffer = recordId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/credential-exchanges/${recordId}/send-request`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data)
        })
        .catch(err => {
              console.error(err);
              alert('Error accepting offer. Please try again.');
        });
    }

    const acceptRequest = recordId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/credential-exchanges/${recordId}/send-credential`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data)
        })
        .catch(err => {
              console.error(err);
              alert('Error accepting request. Please try again.');
        });
    }

    const rejectExchange = (recordId, messageType) => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/credential-exchanges/${recordId}/reject?messageType=${messageType}`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data)
        })
        .catch(err => {
              console.error(err);
              alert(`Error rejecting ${messageType}. Please try again.`);
        });
    }

    const { state, id, role } = props;

    switch(state) {
        case 'init' && role == 'holder':
            return (
                <Button size="small" color="primary" onClick={() => sendProposal(id)}>Send Proposal</Button>
            )
        case 'init' && role == 'issuer':
            return (
                <Button size="small" color="primary" onClick={() => acceptProposal(id)}>Send Offer</Button>
            )
        case 'proposal_received':
            return (
                <div>
                    <Button size="small" color="primary" onClick={() => acceptProposal(id)}>Accept Proposal</Button>
                    <Button size="small" color="primary" onClick={() => rejectExchange(id, "proposal")}>Reject Proposal</Button>
                </div>
            )
        case 'offer_received':
            return (
                <div>
                    <Button size="small" color="primary" onClick={() => acceptOffer(id)}>Accept Offer</Button>
                    <Button size="small" color="primary" onClick={() => rejectExchange(id, "offer")}>Reject Offer</Button>
                </div>
            )
        case 'request_received':
            return (
                <div>
                    <Button size="small" color="primary" onClick={() => acceptRequest(id)}>Accept Request</Button>
                    <Button size="small" color="primary" onClick={() => rejectExchange(id, "request")}>Reject Request</Button>
                </div>
            )
        default:
            return null;
    }
}

// Prop types
RecordActions.propTypes = {
    state: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
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
  
export default connect(mapStateToProps)(RecordActions);



