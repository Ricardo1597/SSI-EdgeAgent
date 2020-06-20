import React, { Component } from 'react'

import axios from 'axios'
import config from '../../../../config'
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import AttributesTable from '../../../AttributesTable';

import uuid from "uuid";
import { connect } from 'react-redux';


class ProposeCredential extends Component {
    state = {
        connectionId: '',
        comment: '',
        credAttrName: '',
        credAttrValue: '',
        credAttributes: [],
        schemaId: '',
        credDefId: '',
        errors: []
    }


    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onAddAttribute = () => {
        if (this.state.credAttrName.length < 3){
            alert('Attribute name must be at least 3 characters long.') 
        } else {
            this.setState({
                credAttributes: [...this.state.credAttributes, {id: uuid(), name: this.state.credAttrName, value: this.state.credAttrValue}],
                credAttrName: '',
                credAttrValue: '',
            });
        }
    }

    onEditAttribute = () => {
        alert("Edit is not yet working...")
    }

    onDeleteAttribute = (id) => {
        this.setState({
            credAttributes: this.state.credAttributes.filter(attr => attr.id !== id)
        });
    }

    handleValidation = () => {
        let errors = [];
        let formIsValid = true;

        // connectionId: e0f748a8-f7b7-4970-9fa5-d2bd9872b7cd (uuid)
        if(this.state.connectionId.length < 1 ){
            formIsValid = false;
            errors["connectionId"] = "Cannot be empty";
        } else if(!this.state.connectionId.match(/^[a-z0-9-]+$/)){
            formIsValid = false;
            errors["connectionId"] = "Invalid characters";
        }

        // schemaId: schema:mybc:did:mybc:V4SGRU86Z58d6TV7PBUe6f:2:cc:1.3
        if(this.state.schemaId.length < 1 ){
            formIsValid = false;
            errors["schemaId"] = "Cannot be empty";
        } else if(!this.state.schemaId.match(/^[a-zA-Z0-9:\-._]+$/)){
            formIsValid = false;
            errors["schemaId"] = "Invalid characters";
        }

        // credDefId: creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:14:TAG1
        if(this.state.credDefId.length < 1 ){
            formIsValid = false;
            errors["credDefId"] = "Cannot be empty";
        } else if(!this.state.credDefId.match(/^[a-zA-Z0-9:\-]+$/)){
            formIsValid = false;
            errors["credDefId"] = "Invalid characters";
        }

        // credAttributes
        if(this.state.credAttributes.length < 1 ){
            formIsValid = false;
            errors["credAttributes"] = "Cannot be empty";
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

        axios.post(`${config.endpoint}/api/credential-exchanges/send-proposal`, {
            connectionId: this.state.connectionId, 
            comment: this.state.comment,
            schemaId: this.state.schemaId,
            credDefId: this.state.credDefId,
            credAttributes: this.state.credAttributes,
        }, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res.data)
                alert("Proposal sent with success!")
                this.setState({invitation: JSON.stringify(res.data.invitation)})
            } else {
                const error = new Error(res.error);
                throw error;
            }
        })
        .catch(err => {
              console.error(err);
              alert('Error sending credential proposal. Please try again.');
        });
    }


    render() {
        const { classes } = this.props;

        return (
            <Container spacing={2}>
                <div className={classes.paper} >
                    <Typography component="span" variant="h5">
                    Propose Credential
                    </Typography>
                    <form noValidate className={classes.form} onSubmit={this.onSubmit2}>
                        <Grid container align='center' spacing={2}>
                            <Grid item xs={12} lg={6}>
                                <Grid container align='left' className={classes.column} spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            variant="outlined"
                                            required
                                            fullWidth
                                            id="connectionId"
                                            label="Connection ID"
                                            name="connectionId"
                                            value={this.state.connectionId}
                                            onChange={this.handleChange}
                                        />
                                    </Grid> 
                                    <Grid item xs={12}>
                                        <TextField
                                            variant="outlined"
                                            required
                                            fullWidth
                                            id="schemaId"
                                            label="Schema ID"
                                            name="schemaId"
                                            value={this.state.schemaId}
                                            onChange={this.handleChange}
                                        />
                                    </Grid> 
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
                                    <Grid item xs={12}>
                                        <TextField
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label="Comment"
                                            name="comment"
                                            id="comment"
                                            value={this.state.comment}
                                            onChange={this.handleChange}

                                        />
                                    </Grid>  
                                </Grid>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Grid container align='left' className={classes.column} spacing={2}> 
                                    <Grid item xs={5}>
                                        <TextField
                                            variant="outlined"
                                            fullWidth
                                            id="credAttrName"
                                            label="Attribute Name"
                                            name="credAttrName"
                                            value={this.state.credAttrName}
                                            onChange={this.handleChange}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    this.onAddAttribute()
                                                }
                                            }}
                                        />
                                    </Grid>       
                                    <Grid item xs={5}>
                                        <TextField
                                            variant="outlined"
                                            fullWidth
                                            id="credAttrValue"
                                            label="Attribute Value"
                                            name="credAttrValue"
                                            value={this.state.credAttrValue}
                                            onChange={this.handleChange}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    this.onAddAttribute()
                                                }
                                            }}
                                        />
                                    </Grid>                             
                                    <Grid item xs={2}>
                                        <Button
                                            type="button"
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            className={classes.add}
                                            onClick={this.onAddAttribute}
                                        >
                                            Add
                                        </Button>
                                    </Grid>                     
                                    <Grid item xs={12}>
                                    <Paper className={classes.root}>
                                        <AttributesTable 
                                            rows={this.state.credAttributes}
                                            width={'100%'}
                                            height={215}
                                            rowHeight={45}
                                            onDeleteAttribute={this.onDeleteAttribute}
                                            onEditAttribute={this.onEditAttribute}
                                        />
                                    </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container className={classes.column} spacing={2}>
                                    <Grid item xs={12}>
                                        <Button
                                            type="button"
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            className={classes.add}
                                            onClick={this.onSubmit}
                                        >
                                            Send Proposal
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
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
        maxWidth: '1050px',
        marginTop: theme.spacing(3),
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
  
export default connect(mapStateToProps)(withStyles(useStyles)(ProposeCredential))
