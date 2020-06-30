import React, { Component } from 'react'

import axios from 'axios'
import config from '../../../../config'
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import uuid from "uuid";
import { connect } from 'react-redux';


class CreateRegistry extends Component {
    state = {
        credDefId: '',
        issuanceByDefault: true,
        maxCredNum: '',
        loading: false,
        errors: []
    }


    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }


    handleValidation = () => {
        let errors = [];
        let formIsValid = true;

        // credDefId: creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:14:TAG1
        if(this.state.credDefId.length < 1 ){
            formIsValid = false;
            errors["credDefId"] = "Cannot be empty";
        } else if(!this.state.credDefId.match(/^[a-zA-Z0-9:\-]+$/)){
            formIsValid = false;
            errors["credDefId"] = "Invalid characters";
        }

        if(typeof this.state.issuanceByDefault !== "boolean"){
            formIsValid = false;
            errors["issuanceByDefault"] = "Must be a boolean";
        } 

        if(this.state.maxCredNum < 10 ){
            formIsValid = false;
            errors["maxCredNum"] = "Must be at least 10";
        } else if(this.state.maxCredNum > 1000000 ){
            formIsValid = false;
            errors["maxCredNum"] = "Must be at most 1000000";
        }

        console.log(errors)
        this.setState({errors: errors});
        return formIsValid;
    }


    onSubmit = (e) => {
        e.preventDefault()

        this.setState({"loading": true});

        if(!this.handleValidation()){
            console.log(this.state.errors)
            return;
        }
            
        const jwt = this.props.accessToken;

        axios.post(`${config.endpoint}/api/revocation/create-registry`, {
            credDefId: this.state.credDefId, 
            issuanceByDefault: this.state.issuanceByDefault,
            maxCredNum: this.state.maxCredNum,
        }, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data);
            alert("Registry created with success!");
        })
        .catch(err => {
              console.error(err);
              alert('Error sending credential proposal. Please try again.');
        })
        .finally(() => {
            this.setState({"loading": false});
        });
    }


    render() {
        const { classes } = this.props;

        return (
            <Container spacing={2}>
                {this.state.loading ? <p>Loading</p> : null}
                <div className={classes.paper} >
                    <Typography component="span" variant="h5">
                    Create Registry
                    </Typography>
                    <form noValidate className={classes.form} onSubmit={this.onSubmit2}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="credDefId"
                                    label="Credential Definition ID"
                                    name="credDefId"
                                    value={this.state.credDefId}
                                    onChange={this.handleChange}
                                />
                            </Grid> 
                            <Grid item xs={4}>
                                <FormControl variant="outlined" className={classes.formControl}>
                                    <InputLabel>Issuance by default</InputLabel>
                                    <Select
                                        variant="outlined"
                                        required
                                        label="Issuance by default"
                                        value={this.state.issuanceByDefault}
                                        onChange={this.handleChange}
                                        inputProps={{
                                            name: 'issuanceByDefault',
                                            id: 'outlined-issuanceByDefault-native-simple',
                                        }}
                                    >
                                        <MenuItem value={true}>Yes</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>  
                            <Grid item xs={8}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="Limit of credentials"
                                    name="maxCredNum"
                                    id="maxCredNum"
                                    value={this.state.maxCredNum}
                                    onChange={this.handleChange}

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
                            Create Registry
                        </Button>
                    </form>
                </div>
            </Container>
        )
    }
}


// Styles
const useStyles = theme => ({
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
    add: {
        height: '40px',
        marginTop: 10
    },
    form: {
        width: '500px', 
        marginTop: theme.spacing(3)
    },
    column: {
        width: '500px', 
    },
    formControl: {
        width: '100%',
    },
    card: {
        width: '200px',
        padding: 20,
        margin: 20
    }
});


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(withStyles(useStyles)(CreateRegistry))
