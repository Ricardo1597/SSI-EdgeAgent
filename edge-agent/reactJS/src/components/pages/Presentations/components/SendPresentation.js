import React, { Component } from 'react'

import axios from 'axios'
import config from '../../../../config'
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import { connect } from 'react-redux';


class SendPresentation extends Component {
    state = {
        // If i want i can add the comment but for now it is not needed
        comment: '',
        requestedCredentials: ''
    }


    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleValidation = () => {
        let errors = [];
        let formIsValid = true;

        // requestedCredentials
        if(this.state.requestedCredentials === '' ){
            formIsValid = false;
            errors["requestedCredentials"] = "Cannot be empty";
        } 

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
            requestedCredentials: JSON.parse(this.state.requestedCredentials),
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



    render() {
        const { classes } = this.props;

        return this.props.recordId 
        ? (
            <Container spacing={2}>
                <div className={classes.paper} >
                    <Typography component="span" variant="h5">
                        Send Presentation
                    </Typography>
                    <form noValidate className={classes.form} onSubmit={this.onSubmit}>
                        <Grid container align='left' className={classes.column} spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    multiline
                                    rows={10}
                                    id="requestedCredentials"
                                    label="Requested Credentials"
                                    name="requestedCredentials"
                                    value={this.state.requestedCredentials}
                                    onChange={this.handleChange}
                                />
                            </Grid>    
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
