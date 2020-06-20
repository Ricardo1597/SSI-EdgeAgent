import React, { Component } from 'react'

import axios from 'axios'
import config from '../../../../config'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { connect } from 'react-redux';


class ReceiveInvitation extends Component {
    state = {
        alias: '',
        invitation: '',
        dids: JSON.parse(localStorage.getItem('dids')).map(did => did.did),
    }


    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onSubmit = e => {
        e.preventDefault()
        const jwt = this.props.accessToken;

        axios.post(`${config.endpoint}/api/connections/receive-invitation`, {
            alias: this.state.alias, 
            invitation: JSON.parse(this.state.invitation)
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
              alert('Error creating invitation. Please try again.');
        });
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid item xs={12} lg={5}>
                <Container maxWidth="xs" spacing={2}>
                    <div className={classes.paper} >
                        <Typography component="span" variant="h5">
                        Receive invitation
                        </Typography>
                        <form className={classes.form} noValidate onSubmit={this.onSubmit2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="alias"
                                        label="Alias"
                                        name="alias"
                                        value={this.state.alias}
                                        onChange={this.handleChange}
                                    />
                                </Grid>  
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        required
                                        rows={10}
                                        label="Invitation Details"
                                        name="invitation"
                                        id="invitation"
                                        value={this.state.invitation}
                                        onChange={this.handleChange}
                                        className={classes.jsonBox}

                                    />
                                </Grid>  
                            </Grid>
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.add}
                                onClick={this.onSubmit}
                            >
                                Receive Invitation
                            </Button>
                        </form>
                    </div>
                </Container>
            </Grid>
        )
    }
}



// Styles
const useStyles = theme => ({
    root: {
      flexGrow: 1,
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    paper: {
        marginTop: 30,
        marginBottom: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    result: {
        margin: 30,
        display: 'flex',
        flexDirection: 'line',
        alignItems: 'center',
    },
    button : {
        "&:focus": {
            outline:"none",
        }
    },
    form: {
        width: '500px', 
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    add: {
        height: '40px',
        marginTop: 10
    },
    jsonBox: {
        marginTop: -10,
    },
    leftMargin: {
        marginLeft: 10,
        marginBottom: -10
    },
    formControl: {
        width: '100%',
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
});


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(withStyles(useStyles)(ReceiveInvitation))
