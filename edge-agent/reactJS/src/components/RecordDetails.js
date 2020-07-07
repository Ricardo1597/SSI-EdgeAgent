import React, { Component } from 'react'
import PropTypes from 'prop-types';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import JSONPretty from 'react-json-pretty';

import { connect } from 'react-redux';


function RecordDetails(props) {
    const { initiator, role, state, threadId, error, connectionId, recordId, proposal } = props.record;
    
    return (
        <div>
            <CardContent>
                <Typography gutterBottom variant="h6" component="h2">
                        {/* Here i could get the connection alias and display that.*/}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="div"> 
                    <div style={styles.marginBottom}>
                        <div style={{fontWeight: "bold"}}>Record ID:</div>
                        {recordId}
                    </div>
                    <div style={styles.marginBottom}>
                        <div style={{fontWeight: "bold"}}>Connection ID:</div>
                        {connectionId}
                    </div>
                    <div style={styles.marginBottom}>
                        <div style={{fontWeight: "bold"}}>Initiator:</div>
                        {initiator}
                    </div>
                    <div style={styles.marginBottom}>
                        <div style={{fontWeight: "bold"}}>Role:</div>
                        {role}
                    </div>
                    <div style={styles.marginBottom}>
                        <div style={{fontWeight: "bold"}}>Thread ID:</div> 
                        {threadId}
                    </div>
                    <div style={styles.marginBottom}>
                        <div style={{fontWeight: "bold"}}>Current State:</div> 
                        {state}
                    </div>
                    {
                        state === "error" && error && error.description && error.description.en ? (
                            <div style={styles.marginBottom}>
                                <div style={{fontWeight: "bold"}}>Error:</div> 
                                {error.description.en}
                            </div>
                        ) : null
                    }
                    <div style={styles.marginBottom}>
                        <div style={{fontWeight: "bold"}}>Credential Proposal:</div>
                        <JSONPretty id="json-pretty" data={proposal}></JSONPretty>
                    </div>
                </Typography>
            </CardContent>
        </div>
    )
}

// Prop types
RecordDetails.propTypes = {
    record: PropTypes.object.isRequired
}


// Styles
const styles = ({
    marginBottom : {
        marginBottom: 8
    },
});

  
export default RecordDetails;