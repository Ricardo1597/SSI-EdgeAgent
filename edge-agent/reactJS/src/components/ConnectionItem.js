import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Card from 'react-bootstrap/Card';
import axios from 'axios'
import config from '../config'
import { connect } from 'react-redux';


export class ConnectionItem extends Component {


    getAction = (state, connectionId) => {
        switch(state) {
            case 'invited':
                return <Card.Link id={connectionId} onClick={this.acceptInvitation}>Accept Invitation</Card.Link>;
            case 'requested':
                return <Card.Link id={connectionId} onClick={this.acceptRequest}>Accept Request</Card.Link>;
            case 'responded':
                return <Card.Link id={connectionId} onClick={this.acceptResponse}>Accept Response</Card.Link>;
            default:
                return;
        }
    }


    acceptInvitation = e => {
        const jwt = this.props.accessToken;
        axios.post(`${config.endpoint}/api/accept_invitation`, {
            id: e.target.id
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
              alert('Error creating DID. Please try again.');
        });
    }


    acceptRequest = e => {
        const jwt = this.props.accessToken;
        axios.post(`${config.endpoint}/api/accept_request`, {
            id: e.target.id
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
              alert('Error creating DID. Please try again.');
        });
    }



    acceptResponse = e => {
        const jwt = this.props.accessToken;
        axios.post(`${config.endpoint}/api/accept_response`, {
            id: e.target.id
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
              alert('Error creating DID. Please try again.');
        });
    }

    render() {
        const { state, alias, connectionId } = this.props.connection;
        return (                  
            <Card style={styles.root}>
                <Card.Body>
                    <Card.Title>{alias}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Hardcoded for created_at</Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">Hardcoded for updated_at</Card.Subtitle>
                    <Card.Text>
                        {state}
                    </Card.Text>
                    <Grid container>
                        <Grid item xs={6}>
                            <Card.Link href="#">Remove</Card.Link>
                        </Grid>
                        <Grid item xs={6}>
                            <div>{this.getAction(state, connectionId)}</div>
                        </Grid>
                    </Grid>
                </Card.Body>
            </Card>
        )
    }
}

// Prop types
ConnectionItem.propTypes = {
    connection: PropTypes.object.isRequired
}


const styles = ({
    root: {
        maxWidth: 350,
        borderRadius: 20,
        margin: 20,
    },
    content: {
        padding: 24,
    },
});


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(ConnectionItem)