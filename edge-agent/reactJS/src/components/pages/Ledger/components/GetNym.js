import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import JSONPretty from 'react-json-pretty';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../config';

class GetNym extends Component {
  state = {
    did: '',
    didNym: null,
    didDocument: null,
    errors: [],
  };

  showSnackbarVariant = (message, variant) => {
    this.props.enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: this.action,
    });
  };

  action = (key) => (
    <Fragment>
      <Button
        style={{ color: 'white' }}
        onClick={() => {
          this.props.closeSnackbar(key);
        }}
      >
        <strong>Dismiss</strong>
      </Button>
    </Fragment>
  );

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  getRole = (role) => {
    switch (role) {
      case null:
        return 'Common user';
      case '0':
        return 'Trustee user';
      case '2':
        return 'Steward user';
      case '101':
        return 'Trust anchor user';
      case '201':
        return 'Network monitor user';
      default:
        return 'Peer did';
    }
  };

  handleValidation = () => {
    let errors = [];
    let formIsValid = true;

    // did: did:mybc:Th7MpTaRZVRYnPiabds81Y
    if (this.state.did.length === 0) {
      formIsValid = false;
      errors['did'] = 'Cannot be empty';
    } else if (!this.state.did.match(/^[a-zA-Z0-9:]+$/)) {
      formIsValid = false;
      errors['did'] = 'Invalid characters';
    } else if (this.state.did.split(':').length !== 3) {
      formIsValid = false;
      errors['did'] = 'Invalid DID';
    }

    console.log(errors);
    this.setState({ errors: errors });
    return formIsValid;
  };

  onSubmit = (e) => {
    e.preventDefault();

    if (!this.handleValidation()) {
      console.log(this.state.errors);
      return;
    }

    const jwt = this.props.accessToken;

    axios
      .get(`${config.endpoint}/api/ledger/get-nym`, {
        params: {
          did: this.state.did,
        },
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        console.log(res.data);
        this.setState({ didNym: res.data.did, didDocument: res.data.didDocument });
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error getting nym from the ledger. Please try again.', 'error');
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <Grid container>
        <Grid item xs={12} lg={5}>
          <div className={classes.paper}>
            <Typography component="span" variant="h5">
              Get Nym
            </Typography>
            <form className={classes.form} onSubmit={this.onSubmit}>
              <Grid container spacing={2}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="did"
                  label="Did"
                  name="did"
                  value={this.state.did}
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
                  Get Nym
                </Button>
              </Grid>
            </form>
          </div>
        </Grid>
        <Grid item xs={12} lg={7}>
          {this.state.didNym ? (
            <div>
              <Card className={classes.card}>
                <CardContent>
                  <div className={classes.marginBottom}>
                    <div style={{ fontWeight: 'bold' }}>DID:</div>
                    {this.state.didNym.dest}
                  </div>
                  <div className={classes.marginBottom}>
                    <div style={{ fontWeight: 'bold' }}>Verkey:</div>
                    {this.state.didNym.verkey}
                  </div>
                  <div className={classes.marginBottom}>
                    <div style={{ fontWeight: 'bold' }}>Role:</div>
                    {this.getRole(this.state.didNym.role)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Added by:</div>
                    {this.state.didNym.identifier}
                  </div>
                </CardContent>
              </Card>
              <Card className={classes.card} style={{ width: 'auto' }}>
                <Typography style={{ marginBottom: 10 }} variant="h6">
                  DID Document
                </Typography>
                <JSONPretty data={this.state.didDocument}></JSONPretty>
              </Card>
            </div>
          ) : null}
        </Grid>
      </Grid>
    );
  }
}

// Styles
const useStyles = (theme) => ({
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
  button: {
    '&:focus': {
      outline: 'none',
    },
  },
  add: {
    height: '40px',
    marginTop: 10,
  },
  form: {
    width: '500px',
    marginTop: theme.spacing(3),
  },
  formControl: {
    width: '100%',
  },
  card: {
    width: '300px',
    padding: 20,
    margin: 20,
  },
  marginBottom: {
    marginBottom: 8,
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(GetNym)));
