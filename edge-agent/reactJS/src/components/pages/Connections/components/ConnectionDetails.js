import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import axios from 'axios'
import config from '../../../../config'

import { connect } from 'react-redux';


export class ConnectionDetails extends Component {

    render() {
        const classes = this.props

        const { state, alias, connectionId, myDid, myVerkey, error } = this.props.connection;
        return (
            <div>
                <CardMedia
                    component="img"
                    alt="Contemplative Reptile"
                    height="140"
                    image="/static/images/cards/contemplative-reptile.jpg"
                    title="Contemplative Reptile"
                />
                <CardContent>
                    <Typography gutterBottom variant="h6" component="h2">
                        {alias}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="div"> 
                        <div style={{marginBottom: 8}}>
                            <div style={{fontWeight: "bold"}}>Connection ID:</div>
                            {connectionId}
                        </div>
                        {
                            myDid ? (
                                <div>
                                    <div style={{marginBottom: 8}}>
                                        <div style={{fontWeight: "bold"}}>My DID:</div>
                                        {myDid}
                                    </div>

                                    <div style={{marginBottom: 8}}>
                                        <div style={{fontWeight: "bold"}}>My Verkey:</div>
                                        {myVerkey}
                                    </div>
                                </div>
                            ) : null
                        }
                        <div style={{marginBottom: 8}}>
                            <div style={{fontWeight: "bold"}}>Current State:</div> 
                            {state}
                        </div>
                        {
                            state === "error" && error && error.description && error.description.en ? (
                                <div style={{marginBottom: 8}}>
                                    <div style={{fontWeight: "bold"}}>Error:</div> 
                                    {error.description.en}
                                </div>
                            ) : null
                        }
                    </Typography>
                </CardContent>
            </div>
        )
    }
}

// Prop types
ConnectionDetails.propTypes = {
    connection: PropTypes.object.isRequired
}


// Styles
const useStyles = theme => ({
    button : {
        "&:focus": {
            outline:"none",
        }
    },
    
});


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(withStyles(useStyles)(ConnectionDetails));