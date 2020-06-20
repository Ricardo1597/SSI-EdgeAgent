import React, { Component } from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { connect } from 'react-redux';

import axios from 'axios'
import config from '../../../../config'

class CreateSchema extends Component {
    state = {
        name: '',
        version: '',
        attribute: '',
        attributes: [],
        did: '',
        dids: JSON.parse(localStorage.getItem('dids')).map(did => did.did),
        schema: ''
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
        const jwt = this.props.accessToken;

        axios.post(`${config.endpoint}/api/ledger/create-schema`, {
            name: this.state.name, 
            version: this.state.version,
            attributes: this.state.attributes,
            did: this.state.did
        }, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data);
        })
        .catch(err => {
              console.error(err);
              alert('Error creating schema. Please try again.');
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
            <Grid container>
                <Grid item xs={12} lg={5}>
                    <div className={classes.paper}>
                        <Typography component="span" variant="h5">
                        Create Schema
                        </Typography>
                        <form className={classes.form} onSubmit={this.onSubmit}>
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
                                type="button"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={[classes.add, classes.button]}
                                onClick={this.onSubmit}
                            >
                                Create
                            </Button>
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
  
export default connect(mapStateToProps)(withStyles(useStyles)(CreateSchema))