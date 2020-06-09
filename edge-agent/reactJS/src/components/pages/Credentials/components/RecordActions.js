import React from 'react'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios'
import config from '../../../../config'

import { connect } from 'react-redux';


function RecordActions(props) {
    const classes = useStyles();


    const acceptProposal = recordId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/${recordId}/send_credential_offer`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res.data)
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


    const acceptOffer = recordId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/${recordId}/send_credential_request`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res.data)
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



    const acceptRequest = recordId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/${recordId}/send_credential`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res.data)
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

    const { state, id } = props;

    switch(state) {
        case 'proposal_received':
            return <Button size="small" color="primary" onClick={() => acceptProposal(id)}>Accept Proposal</Button>;
        case 'offer_received':
            return <Button size="small" color="primary" onClick={() => acceptOffer(id)}>Accept Offer</Button>;
        case 'request_received':
            return <Button size="small" color="primary" onClick={() => acceptRequest(id)}>Accept Request</Button>;
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



