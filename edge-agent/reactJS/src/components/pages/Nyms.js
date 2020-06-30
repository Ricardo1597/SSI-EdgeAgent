import React, { Component } from 'react'

import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import config from '../../config'
import axios from 'axios'
import { connect } from 'react-redux';


class Nyms extends Component {
    state = {
        dids: JSON.parse(localStorage.getItem('dids'))
                  .filter(did => did.role !== 'no role' && did.role !== null)
                  .map(did => did.did),
        did: '',
        newDid: '',
        newVerKey: '',
        role: '',
        didNym: '',
    }


    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onSubmit = e => {
        e.preventDefault()
        const jwt = this.props.accessToken;

        axios.post(`${config.endpoint}/api/ledger/send-nym`, {
            did: this.state.did, 
            newDid: this.state.newDid,
            newVerKey: this.state.newVerKey,
            role: this.state.role
        }, { 
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
              alert('Error creating NYM. Please try again.');
        });
    }


    onSubmit2 = e => {
        e.preventDefault()
        const jwt = this.props.accessToken;

        axios.get(`${config.endpoint}/api/ledger/get-nym`, {
            params: {
              did: this.state.didNym
            },
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
              alert('Error getting NYM. Please try again.');
        });
    }


    renderNym = () => {
        // Render the server response from getting the Nym info
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid container component="main">
                <CssBaseline />
                <Grid item xs={12} md={6}>
                    <Container maxWidth="xs">
                        <div className={classes.paper} >
                            <Typography component="span" variant="h5">
                            Create Nym
                            </Typography>
                            <form className={classes.form} noValidate onSubmit={this.onSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" className={classes.formControl}>
                                        <InputLabel>DID</InputLabel>
                                        <Select
                                            variant="outlined"
                                            required
                                            label="DID"
                                            name="did"
                                            id="did"
                                            value={this.state.did}
                                            onChange={this.handleChange}
                                        >
                                            {this.state.dids.map(did => {
                                                return (<MenuItem key={did} value={did}>{did}</MenuItem>)
                                            })}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="newDid"
                                        label="New DID"
                                        name="newDid"
                                        value={this.state.newDid}
                                        onChange={this.handleChange}
                                    />
                                </Grid>            
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="newVerKey"
                                        label="New VerKey"
                                        name="newVerKey"
                                        value={this.state.newVerKey}
                                        onChange={this.handleChange}
                                    />
                                </Grid>              
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" className={classes.formControl}>
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            variant="outlined"
                                            required
                                            label="Role"
                                            name="role"
                                            id="role"
                                            value={this.state.role}
                                            onChange={this.handleChange}
                                        >
                                            <MenuItem key={0} value='COMMON_USER'>Common User</MenuItem>
                                            <MenuItem key={1} value='NETWORK_MONITOR'>Network Monitor</MenuItem>
                                            <MenuItem key={2} value='TRUST_ANCHOR'>Trust Anchor</MenuItem>
                                            <MenuItem key={3} value='STEWARD'>Steward</MenuItem>
                                            <MenuItem key={4} value='TRUSTEE'>Trustee</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>    
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                            >
                                Add Nym
                            </Button>
                            </form>
                        </div>
                    </Container>
                </Grid>
                <div className={classes.paper} >
                    <Typography component="span" variant="h5">
                    Get Nym
                    </Typography>
                    <form className={classes.form} noValidate onSubmit={this.onSubmit2}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <TextField 
                                    variant="outlined"
                                    required
                                    fullWidth
                                    type="text"
                                    id="didNym"
                                    label="DID"
                                    name="didNym"
                                    autoFocus
                                    value={this.state.didNym}
                                    onChange={this.handleChange}
                                />
                                <Button 
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary" 
                                    className={classes.submit}
                                >Get
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid>
                            {this.renderNym()}
                        </Grid>
                    </form>
                </div>
            </Grid>
        )
    }
}


// Styles
const useStyles = theme => ({
    root: {
        //height: '80vh',
    },
    paper: {
        marginTop: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        width: '400px', // Fix IE 11 issue.
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
  
export default connect(mapStateToProps)(withStyles(useStyles)(Nyms))
