import React, { Component } from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import JSONPretty from 'react-json-pretty';

import axios from 'axios'
import config from '../../../../config'

class GetRegistry extends Component {
    
    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }


    onSubmit = (e) => {
        e.preventDefault()

        this.setState({"loading": true});
            
        const jwt = this.props.accessToken;

        axios.post(`${config.endpoint}/api/credential-exchanges/publish-revocations`, {}, { 
            headers: { Authorization: `Bearer ${jwt}`} 
        })
        .then(res => {
            console.log(res.data);
            alert("Credentials revoked with success!");
        })
        .catch(err => {
              console.error(err);
              alert('Error revoking credentials. Please try again.');
        })
        .finally(() => {
            this.setState({"loading": false});
        });
    }


    render() {
        const { classes, registries } = this.props;

        return (
            <Grid container>
                <Grid item xs={12} lg={5}>
                    <div className={classes.paper}>
                        <Typography component="span" variant="h5">
                        My Registries
                        </Typography>
                    </div>
                </Grid>
                <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.add}
                    onClick={this.onSubmit}
                >
                    Publish All
                </Button>
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
        width: '500px',
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
  
export default connect(mapStateToProps)(withStyles(useStyles)(GetRegistry))