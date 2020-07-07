import React, { Component } from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import axios from 'axios'
import config from '../../../../config'

class GetSchema extends Component {
    state = {
        schemaId: '',
        schema: ''
    }

    
    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleValidation = () => {
        let errors = [];
        let formIsValid = true;
    
        // schemaId: schema:mybc:did:mybc:V4SGRU86Z58d6TV7PBUe6f:2:cc:1.3
        if(this.state.schemaId.length < 1 ){
            formIsValid = false;
            errors["schemaId"] = "Cannot be empty";
        } else if(!this.state.schemaId.match(/^[a-zA-Z0-9:\-._]+$/)){
            formIsValid = false;
            errors["schemaId"] = "Invalid characters";
        }
    
        console.log(errors)
        this.setState({errors: errors});
        return formIsValid;
    }
    
    
    onSubmit = (e) => {
        e.preventDefault();
    
        if(!this.handleValidation()){
          console.log(this.state.errors)
          return;
        }

        const jwt = this.props.accessToken;

        axios.get(`${config.endpoint}/api/ledger/get-schema`, {
            params: {
            schemaId: this.state.schemaId
            },
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
            console.log(res.data)
            this.setState({schema: res.data.schema})
            } else {
            const error = new Error(res.error);
            throw error;
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error getting schema. Please try again.');
        });
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid container>
                <Grid item xs={12} lg={5}>
                    <div className={classes.paper}>
                        <Typography component="span" variant="h5">
                        Get Schema
                        </Typography>
                        <form className={classes.form} onSubmit={this.onSubmit}>
                            <Grid container spacing={2}>
                                <TextField 
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="schemaId"
                                    label="Schema ID"
                                    name="schemaId"
                                    placeholder='Leave this blank for a new random DID' 
                                    value={this.state.schemaId}
                                    onChange={this.handleChange}
                                />
                                <Button 
                                    type="button"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    className={[classes.add, classes.button]}
                                    onClick={this.onSubmit}
                                >
                                    Get Schema
                                </Button>
                            </Grid>
                        </form>
                    </div>
                </Grid>
                <Grid item xs={12} lg={7}>
                    {
                        this.state.schema !== "" ? (
                            <Card className={classes.card}>
                                <p>Name: {this.state.schema.name}</p>
                                <p>Version: {this.state.schema.version}</p>                    
                                Attributes:
                                <ul>
                                    {this.state.schema.attrNames.map(attr => {
                                        return <li key={attr}>{attr}</li>
                                    })}
                                </ul>
                            </Card>
                        ) : null
                            
                    }
                </Grid>
            </Grid>
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
        marginTop: theme.spacing(3),
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
  
export default connect(mapStateToProps)(withStyles(useStyles)(GetSchema))