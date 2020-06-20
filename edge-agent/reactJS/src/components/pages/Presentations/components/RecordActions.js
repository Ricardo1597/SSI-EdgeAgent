import React from 'react'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import axios from 'axios'
import config from '../../../../config'

import { connect } from 'react-redux';


function RecordActions(props) {
    const classes = useStyles();


    const verifyPresentation = recordId => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/presentation-exchanges/${recordId}/verify-presentation`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data)
        })
        .catch(err => {
              console.error(err);
              alert('Error accepting connection. Please try again.');
        });
    }

    const rejectExchange = (recordId, messageType) => {
        const jwt = props.accessToken;
        axios.post(`${config.endpoint}/api/presentation-exchanges/${recordId}/reject?messageType=${messageType}`, {}, { 
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

    const { state, id } = props;

    switch(state) {
        case 'proposal_received':
            return (
                <div>
                    <Button size="small" color="primary" onClick={(e) => props.changeTabs(e, 2, id)}>Accept Proposal</Button>
                    <Button size="small" color="primary" onClick={() => rejectExchange(id, "proposal")}>Reject Proposal</Button>
                </div>
            )
        case 'request_received':
            return (
                <div>
                    <Button size="small" color="primary" onClick={(e) => props.changeTabs(e, 3, id)}>Accept Request</Button>
                    <Button size="small" color="primary" onClick={() => rejectExchange(id, "request")}>Reject Request</Button>
                </div>
            )
        case 'presentation_received':
            return <Button size="small" color="primary" onClick={() => verifyPresentation(id)}>Verify Presentation</Button>
        case 'done':
            return <Button size="small" color="primary" onClick={() => verifyPresentation(id)}>Verify Presentation</Button>
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



