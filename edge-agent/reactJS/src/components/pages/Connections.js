import React, { Component } from 'react'

import axios from 'axios'
import config from '../../config'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ConnectionItem from '../ConnectionItem';
import { connect } from 'react-redux';


class Relationships extends Component {
    state = {
        connections: [],
        connectionid: '',
        aliasCreate: '',
        public: false,
        did: '',
        aliasReceive: '',
        invitation: '',
        dids: JSON.parse(localStorage.getItem('dids')).map(did => did.did),
    }


    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    changePublic = e => {
        this.setState({
            [e.target.name]: e.target.value,
            did: ''
        })
    }

    componentWillMount() {
        const jwt = this.props.accessToken;

        axios.get(`${config.endpoint}/api/connections`, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res.data)
                this.setState({
                    connections: res.data.connections
                })
            } else {
                const error = new Error(res.error);
                throw error;
            }
        })
        .catch(err => {
              console.error(err);
              alert('Error getting connections. Please try again.');
        });
    }

    onSubmit = e => {
        e.preventDefault()
        const jwt = this.props.accessToken;

        axios.post(`${config.endpoint}/api/create_invitation`, {
            alias: this.state.aliasCreate, 
            public: this.state.public,
            did: this.state.did
        }, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res.data.invitation)
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

    onSubmit2 = e => {
        e.preventDefault()
        const jwt = this.props.accessToken;
        console.log(this.state.aliasReceive)
        console.log(this.state.invitation)

        axios.post(`${config.endpoint}/api/receive_invitation`, {
            alias: this.state.aliasReceive, 
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
              alert('Error creating DID. Please try again.');
        });
    }

    render() {
        const { classes } = this.props
        return (
            <Grid container component="main">
                <CssBaseline />
                <Grid item xs={12} md={6}>
                    <Container maxWidth="xs">
                        <div className={classes.paper}>
                            <Typography component="h1" variant="h5">
                            Create Invitation
                            </Typography>
                            <form className={classes.form} onSubmit={this.onSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            variant="outlined"
                                            required
                                            fullWidth
                                            id="aliasCreate"
                                            label="Alias"
                                            name="aliasCreate"
                                            value={this.state.aliasCreate}
                                            onChange={this.handleChange}
                                        />
                                    </Grid>  
                                    <Grid item md={12} lg={3}>
                                        <FormControl variant="outlined" className={classes.formControl}>
                                            <InputLabel htmlFor="outlined-public-native-simple">Public</InputLabel>
                                            <Select
                                                variant="outlined"
                                                required
                                                label="Public"
                                                value={this.state.public}
                                                onChange={this.changePublic}
                                                inputProps={{
                                                    name: 'public',
                                                    id: 'outlined-public-native-simple',
                                                }}
                                            >
                                                <MenuItem value={true}>Yes</MenuItem>
                                                <MenuItem value={false}>No</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>  
                                    <Grid item hidden={!this.state.public} md={12} lg={9}>
                                        <FormControl variant="outlined" className={classes.formControl}>
                                            <InputLabel htmlFor="outlined-did-native-simple">DID</InputLabel>
                                            <Select
                                                variant="outlined"
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
                                </Grid>
                                <Button
                                    type="button"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    className={classes.add}
                                    onClick={this.onSubmit}
                                >
                                    Create Invitation
                                </Button>
                            </form>
                        </div>
                    </Container>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Container maxWidth="xs" spacing={2}>
                        <div className={classes.paper} >
                            <Typography component="h1" variant="h5">
                            Accept invitation
                            </Typography>
                            <form className={classes.form} noValidate onSubmit={this.onSubmit2}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            variant="outlined"
                                            required
                                            fullWidth
                                            id="aliasReceive"
                                            label="Alias"
                                            name="aliasReceive"
                                            value={this.state.aliasReceive}
                                            onChange={this.handleChange}
                                        />
                                    </Grid>  
                                    <Grid item xs={12}>
                                        <TextField
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            required
                                            rows={6}
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
                                    onClick={this.onSubmit2}
                                >
                                    Accept Invitation
                                </Button>
                            </form>
                        </div>
                    </Container>
                </Grid>
                <Grid container>
                    {this.state.connections.map(connection => ( 
                        <Grid item xs={12} sm={6} md={4} lg={3} key={connection.connectionId}> 
                            <ConnectionItem connection={connection}/>
                        </Grid>
                    ))}
                </Grid>
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
        marginTop: 30,
        marginBottom: 30,
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
  
export default connect(mapStateToProps)(withStyles(useStyles)(Relationships))
