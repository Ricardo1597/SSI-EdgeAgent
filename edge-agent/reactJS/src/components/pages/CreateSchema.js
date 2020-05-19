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

import axios from 'axios'

class CreateSchema extends Component {
    state = {
        name: '',
        version: '',
        attribute: '',
        attributes: [],
        did: '',
        dids: JSON.parse(localStorage.getItem('dids')).map(did => did.did),
        didCredDef: '',
        schemaId: ''
    }


    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleChangeAttribute = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onSubmit = e => {
        e.preventDefault()
        const jwt = localStorage.getItem('my-jwt')

        axios.post('/api/createSchema', {
            name: this.state.name, 
            version: this.state.version,
            attributes: this.state.attributes,
            did: this.state.did
        }, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            if (res.status === 200) {
                console.log(res)
                //localStorage.setItem('dids', JSON.stringify(res.data.dids))
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
        const jwt = localStorage.getItem('my-jwt')

        axios.post('/api/createCredDef', {
            did: this.state.didCredDef,
            schemaId: this.state.schemaId

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
              alert('Error creating DID. Please try again.');
        });
    }

    onAddAttribute = () => {
        this.setState({
            attributes: [...this.state.attributes, this.state.attribute],
            attribute: ''
          });
    }


    render() {
        const { classes } = this.props;

        let value = JSON.stringify(this.state.attributes).replace(/"/g, '\'').replace(/,/g, ", ");

        return (
            <Grid container component="main">
                <CssBaseline />
                <Grid item xs={12} md={6}>
                    <Container maxWidth="xs">
                        <div className={classes.paper} >
                            <Typography component="h1" variant="h5">
                            Create schema
                            </Typography>
                            <form className={classes.form} noValidate onSubmit={this.onSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" className={classes.formControl}>
                                        <InputLabel htmlFor="outlined-did-native-simple">DID</InputLabel>
                                        <Select
                                            native
                                            required
                                            label="DID"
                                            value={this.state.did}
                                            onChange={this.handleChange}
                                            inputProps={{
                                                name: 'did',
                                                id: 'outlined-did-native-simple',
                                            }}
                                        >
                                            {this.state.dids.map(did => {
                                                return (<option key={did} value={did}>{did}</option>)
                                            })}
                                        >
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="name"
                                        label="Name"
                                        name="name"
                                        value={this.state.name}
                                        onChange={this.handleChange}
                                    />
                                </Grid>            
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="version"
                                        label="Version"
                                        name="version"
                                        value={this.state.version}
                                        onChange={this.handleChange}
                                    />
                                </Grid>   
                                <Grid item className={classes.leftMargin} xs={12} sm={4}>
                                    <h6>Attributes: </h6>                          
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        required
                                        rows={6}
                                        name="attributes"
                                        id="attributes"
                                        value={value}
                                        disabled
                                        className={classes.jsonBox}

                                    />
                                </Grid>
                                <Grid item xs={9} sm={9}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        id="attribute"
                                        label="Attribute"
                                        name="attribute"
                                        value={this.state.attribute}
                                        onChange={this.handleChange}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                if (this.state.attribute.length < 3){
                                                    alert('Attribute must be at least 3 characters long.') 
                                                } else{
                                                    this.onAddAttribute()
                                                }
                                            }
                                        }}
                                    />
                                </Grid>                              
                                <Grid item xs={2} sm={2}>
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
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                            >
                                Create
                            </Button>
                            </form>
                        </div>
                    </Container>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Container maxWidth="xs">
                        <div className={classes.paper} >
                            <Typography component="h1" variant="h5">
                            Create credential definition
                            </Typography>
                            <form className={classes.form} noValidate onSubmit={this.onSubmit2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl variant="outlined" className={classes.formControl}>
                                        <InputLabel htmlFor="outlined-did-native-simple">DID</InputLabel>
                                        <Select
                                            native
                                            required
                                            label="DID"
                                            value={this.state.didCredDef}
                                            onChange={this.handleChange}
                                            inputProps={{
                                                name: 'didCredDef',
                                                id: 'outlined-did-cred-def-native-simple',
                                            }}
                                        >
                                            {this.state.dids.map(did => {
                                                return (<option key={did} value={did}>{did}</option>)
                                            })}
                                        >
                                        </Select>
                                    </FormControl>
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
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                            >
                                Create
                            </Button>
                            </form>
                        </div>
                    </Container>
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


  
export default withStyles(useStyles)(CreateSchema)