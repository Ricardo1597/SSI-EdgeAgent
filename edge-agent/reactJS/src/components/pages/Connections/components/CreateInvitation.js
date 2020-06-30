import React, { Component } from 'react'

import axios from 'axios'
import config from '../../../../config'
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import JSONPretty from 'react-json-pretty';

import { connect } from 'react-redux';


class CreateInvitation extends Component {
    state = {
        alias: '',
        isPublic: false,
        isMultiuse: true,
        did: '',
        invitation: '',
        dids: JSON.parse(localStorage.getItem('dids'))
                  .filter(did => did.role !== 'no role')
                  .map(did => did.did),
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

    onSubmit = e => {
        e.preventDefault()
        const jwt = this.props.accessToken;

        axios.post(`${config.endpoint}/api/connections/create-invitation`, {
            alias: this.state.alias, 
            isPublic: this.state.isPublic,
            isMultiuse: this.state.isMultiuse,
            did: this.state.did
        }, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res.data.invitation)
                this.setState({invitation: JSON.stringify(res.data.invitation)})
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
        const { classes } = this.props;

        return (
            <Grid container>
                <Grid item xs={12} lg={5}>
                    <Container maxWidth="xs">
                        <div className={classes.paper}>
                            <Typography component="span" variant="h5">
                            Create Invitation
                            </Typography>
                            <form className={classes.form} onSubmit={this.onSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={9}>
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
                                    <Grid item xs={12} sm={3}>
                                        <FormControl variant="outlined" className={classes.formControl}>
                                            <InputLabel>Multiuse</InputLabel>
                                            <Select
                                                variant="outlined"
                                                required
                                                label="Multiuse"
                                                name="isMultiuse"
                                                id="isMultiuse"
                                                value={this.state.isMultiuse}
                                                onChange={this.handleChange}
                                            >
                                                <MenuItem value={true}>Yes</MenuItem>
                                                <MenuItem value={false}>No</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>  
                                    <Grid item xs={12} sm={3}>
                                        <FormControl variant="outlined" className={classes.formControl}>
                                            <InputLabel>Public</InputLabel>
                                            <Select
                                                variant="outlined"
                                                required
                                                label="Public"
                                                value={this.state.isPublic}
                                                onChange={this.changePublic}
                                                inputProps={{
                                                    name: 'isPublic',
                                                    id: 'outlined-isPublic-native-simple',
                                                }}
                                            >
                                                <MenuItem value={true}>Yes</MenuItem>
                                                <MenuItem value={false}>No</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>  
                                    <Grid item xs={12} sm={9}>
                                        <FormControl variant="outlined" className={classes.formControl}>
                                            <InputLabel>DID</InputLabel>
                                            <Select
                                                variant="outlined"
                                                label="DID"
                                                disabled={!this.state.isPublic}
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
                                    className={[classes.add, classes.button]}
                                    onClick={this.onSubmit}
                                >
                                    Create Invitation
                                </Button>
                            </form>
                        </div>
                    </Container>
                </Grid>
                <Grid item xs={12} lg={7}>
                    <Grid container className={classes.result}>
                        {
                            this.state.invitation !== "" ? 
                            (
                                <Grid item xs={12}>
                                    <Typography variant="h6">
                                    Invitation Details
                                    </Typography>
                                    <JSONPretty id="json-pretty" data={this.state.invitation}></JSONPretty>
                                </Grid>
                            ) : null   
                        }
                        {
                            this.state.invitation !== ""? 
                            (
                                <Grid item xs={12}>
                                    <Typography variant="h6">
                                    Invitation URL
                                    </Typography>
                                </Grid>
                            ) : null   
                        }
                        {
                            this.state.invitation !== ""? 
                            (
                                <Grid item xs={12}>
                                    <Typography variant="h6">
                                    Invitation QRCode
                                    </Typography>
                                </Grid>
                            ) : null   
                        }
                    </Grid>
                </Grid>
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
  
export default connect(mapStateToProps)(withStyles(useStyles)(CreateInvitation))
