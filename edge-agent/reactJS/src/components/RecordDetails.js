import React, { Component } from 'react'
import PropTypes from 'prop-types';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import JSONPretty from 'react-json-pretty';

import { connect } from 'react-redux';


export class RecordDetails extends Component {
    render() {
        const classes = this.props
        
        const { initiator, role, state, threadId, connectionId, recordId, proposal } = this.props.record;
        return (
            <div>
                <CardContent>
                    <Typography gutterBottom variant="h6" component="h2">
                            {/* Here i could get the connection alias and display that.*/}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="div"> 
                        <div style={{marginBottom: 8}}>
                            <div style={{fontWeight: "bold"}}>Record ID:</div>
                            {recordId}
                        </div>
                        <div style={{marginBottom: 8}}>
                            <div style={{fontWeight: "bold"}}>Connection ID:</div>
                            {connectionId}
                        </div>
                        <div style={{marginBottom: 8}}>
                            <div style={{fontWeight: "bold"}}>Initiator:</div>
                            {initiator}
                        </div>
                        <div style={{marginBottom: 8}}>
                            <div style={{fontWeight: "bold"}}>Role:</div>
                            {role}
                        </div>
                        <div style={{marginBottom: 8}}>
                            <div style={{fontWeight: "bold"}}>Current State:</div> 
                            {state}
                        </div>
                        <div style={{marginBottom: 8}}>
                            <div style={{fontWeight: "bold"}}>Thread ID:</div> 
                            {threadId}
                        </div>
                        <div style={{marginBottom: 8}}>
                            <div style={{fontWeight: "bold"}}>Credential Proposal:</div>
                            <JSONPretty id="json-pretty" data={proposal}></JSONPretty>
                        </div>
                    </Typography>
                </CardContent>
            </div>
        )
    }
}

// Prop types
RecordDetails.propTypes = {
    record: PropTypes.object.isRequired
}


// Styles
const useStyles = theme => ({
    button : {
        "&:focus": {
            outline:"none",
        }
    },
    
});

  
export default withStyles(useStyles)(RecordDetails);