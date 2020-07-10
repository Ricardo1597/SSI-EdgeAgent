import React, { Component } from 'react'

import axios from 'axios'
import config from '../../../../config'
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { connect } from 'react-redux';


class SendPresentation extends Component {
    state = {
        proofReq: null,
        dinamicInputs: {
            requested_attributes: {},
            requested_predicates: {},
            self_attested_attributes: {},
        },
        credentials: {}, // credentials that match this proof request
        // If i want i can add the comment but for now it is not needed
        comment: '',
    }


    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleChangeAttributes = (attribType, e) => {
        let dinamicInputs = this.state.dinamicInputs;
        dinamicInputs[attribType][e.target.name] = e.target.value;
        this.setState({
            dinamicInputs: dinamicInputs
        })
    }

    handleValidation = () => {
        let errors = [];
        let formIsValid = true;

        // dinamicInputs
        

        console.log(errors)
        this.setState({errors: errors});
        return formIsValid;
    }

    onSubmit = (e) => {
        e.preventDefault()

        if(!this.handleValidation()){
            console.log(this.state.errors)
            return;
        }
            
        const jwt = this.props.accessToken;

        axios.post(`${config.endpoint}/api/presentation-exchanges/${this.props.recordId}/send-presentation`, {
            comment: this.state.comment,
            requestedAttributes: this.state.dinamicInputs,
        }, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res.data)
                alert("Presentation sent with success!")
            } else {
                const error = new Error(res.error);
                throw error;
            }
        })
        .catch(err => {
              console.error(err);
              alert('Error sending presentation. Please try again.');
        });
    }

    
    componentWillMount() {
        const jwt = this.props.accessToken;

        axios.get(`${config.endpoint}/api/presentation-exchanges/${this.props.recordId}`, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data)
            console.log(res.data.record.presentationRequest)
            this.setState({
                proofReq: res.data.record.presentationRequest
            })
            axios.post(`${config.endpoint}/api/wallet/credentials-for-request`, {
                proofRequest: res.data.record.presentationRequest
            }, { 
                headers: { Authorization: `Bearer ${jwt}`} 
            })
            .then(res => {
                console.log(res.data)
                this.setState({
                    credentials: res.data.credentials
                })
            })
            .catch(err => {
                console.log('Error getting credentials for proof request.');
                console.error(err);
            });
        })
        .catch(err => {
            console.error(err);
            alert('Error getting presentation exchanges records. Please try again.');
        });
    }


    render() {
        const { classes } = this.props;

        console.log("Inputs: ", this.state.dinamicInputs);

        return this.props.recordId && this.state.proofReq && Object.keys(this.state.credentials).length
        ? (
            <Container spacing={2}>
                <div className={classes.paper} >
                    <Typography component="span" variant="h5">
                        Send Presentation
                    </Typography>
                    <form noValidate className={classes.form} onSubmit={this.onSubmit}>
                        <Grid container align='left' className={classes.column} spacing={2}>
                        { 
                            Object.entries(this.state.proofReq['requested_attributes'] || {}).map(([key, value]) => {
                                return (
                                    <Grid item key={key} xs={12}>
                                        <FormControl variant="outlined" className={classes.formControl}>
                                            <InputLabel>{value.name}</InputLabel>
                                            <Select
                                                variant="outlined"
                                                required
                                                label={value.name}
                                                name={key}
                                                id={key}
                                                value={this.state.dinamicInputs.requested_attributes[key]}
                                                onChange={this.handleChangeAttributes.bind(this, "requested_attributes")}
                                            >
                                                {this.state.credentials.requested_attributes[key].map(credential => {
                                                    return (
                                                        <MenuItem key={credential.cred_info.referent} value={credential.cred_info.referent}>
                                                            {`${credential.cred_info.attrs[value.name]} - ${credential.cred_info.referent}`}
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>
                                        </FormControl>
                                    </Grid> 
                                )  
                            })
                        } 
                        {
                            Object.entries(this.state.proofReq['requested_predicates'] || {}).map(([key, value]) => {
                                return (
                                    <Grid item key={key} xs={12}>
                                        <FormControl variant="outlined" className={classes.formControl}>
                                            <InputLabel>{value.name}</InputLabel>
                                            <Select
                                                variant="outlined"
                                                required
                                                fullWidth
                                                label={value.name}
                                                name={key}
                                                id={key}
                                                value={this.state.dinamicInputs.requested_predicates[key]}
                                                onChange={this.handleChangeAttributes.bind(this, "requested_predicates")}
                                            >
                                                {this.state.credentials.requested_predicates[key].map(credential => {
                                                    return (
                                                        <MenuItem key={credential.cred_info.referent} value={credential.cred_info.referent}>
                                                            {`${credential.cred_info.attrs[value.name]} - ${credential.cred_info.referent}`}
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>
                                        </FormControl>
                                    </Grid> 
                                )  
                            })
                        }
                        {
                            Object.entries(this.state.proofReq['self_attested_attributes'] || {}).map(([key, value]) => {
                                return (
                                    <Grid item key={key} xs={12}>
                                        <FormControl variant="outlined" className={classes.formControl}>
                                            <InputLabel>{value.name}</InputLabel>
                                            <Select
                                                variant="outlined"
                                                required
                                                fullWidth
                                                label={value.name}
                                                name={key}
                                                id={key}
                                                value={this.state.dinamicInputs.self_attested_attributes[key]}
                                                onChange={this.handleChangeAttributes.bind(this, "self_attested_attributes")}
                                            >
                                                {this.state.credentials.self_attested_attributes[key].map(credential => {
                                                    return (
                                                        <MenuItem key={credential.cred_info.referent} value={credential.cred_info.referent}>
                                                            {`${credential.cred_info.attrs[value.name]} - ${credential.cred_info.referent}`}
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>
                                        </FormControl>
                                    </Grid> 
                                )  
                            })
                        }
                        </Grid>
                        <Button
                            type="button"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={`${classes.add} ${classes.button}`}
                            onClick={this.onSubmit}
                        >
                            Send Presentation
                        </Button>
                    </form>
                </div>
            </Container>
        ) : null
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
        maxWidth: '500',
        marginTop: theme.spacing(3),
    },
    column: {
        width: '500px', 
    },
    formControl: {
        width: '100%',
    },
});


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(withStyles(useStyles)(SendPresentation))
