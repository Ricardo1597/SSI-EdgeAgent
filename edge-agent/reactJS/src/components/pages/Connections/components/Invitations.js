import React, { Component } from 'react'

import axios from 'axios'
import config from '../../../../config'
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container'

import InvitationItem from './InvitationItem';
import InvitationDetails from './InvitationDetails';
import InvitationActions from './InvitationActions.js';

import { connect } from 'react-redux';


class Invitations extends Component {
    state = {
        invitations: [],
        invitation: '',
    }


    changeInvitation = (id) => {
        const invitation = this.state.invitations.find(invitation => {
            return invitation.invitationId === id;
        })
        if(invitation != null)
            this.setState({invitation: invitation})
    }


    deleteInvitation = id => {
        const jwt = this.props.accessToken;

        // axios.delete(`${config.endpoint}/api/connections/invitations/${id}`, { 
        //     headers: { Authorization: `Bearer ${jwt}`} 
        // })
        // .then(res => {
        //     console.log(res.data.id)
        // })
        // .catch(err => {
        //       console.error(err);
        //       alert('Error deleting connection. Please try again.');
        // });
        console.log("Action not available yet!\nID: ", id)
    }
    

    componentWillMount() {
        const jwt = this.props.accessToken;

        axios.get(`${config.endpoint}/api/connections/invitations`, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data)
            this.setState({
                invitations: res.data.invitations
            })
        })
        .catch(err => {
              console.error(err);
              alert('Error getting invitations. Please try again.');
        });
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <Grid container>
                    <Grid item className={classes.card}>
                        <Container className='scrollBar' style={{height: '85vh', 'overflow-y': 'scroll'}} maxWidth="xs">
                            {
                                this.state.invitations ? (
                                    this.state.invitations.map(invitation => ( 
                                        <Grid 
                                            item 
                                            xs={12} 
                                            key={invitation.invitationId}
                                            onClick={this.changeInvitation.bind(this, invitation.invitationId)}
                                        > 
                                            <InvitationItem invitation={invitation}/>
                                        </Grid>
                                    ))
                                ) : null
                            }
                        </Container>
                    </Grid>
                    <Grid item className={classes.details}>
                        {
                            this.state.invitation !== '' ? (
                                <Card>
                                    <InvitationDetails invitation={this.state.invitation}/>
                                    <CardActions>
                                        <InvitationActions invitation={this.state.invitation}/>
                                        <Button 
                                            size="small" 
                                            color="primary" 
                                            onClick={this.deleteInvitation.bind(
                                                this, 
                                                this.state.invitation.invitationId
                                            )}>
                                            Remove Invitation
                                        </Button>
                                    </CardActions>
                                </Card>
                            ) : null
                        }
                    </Grid>
                </Grid>
            </div>
        )
    }
}


// Styles
const useStyles = theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        height: '100%'
    },
    card: {
        width: 430
    },
    details: {  
        margin: 20,
        padding: 20,
        borderRadius: 10,
        flexGrow: 1,
        backgroundColor: '#F6F6F6',
    }
});


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(withStyles(useStyles)(Invitations))
