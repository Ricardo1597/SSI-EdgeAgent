import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import JSONPretty from 'react-json-pretty';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import Container from '@material-ui/core/Container';

import axios from 'axios';
import config from '../../../../config';
import SchemaCard from './SchemaCard';
import NymCard from './NymCard';

class GetTransaction extends Component {
  state = {
    schemaId: '',
    schema: null,
    credDefId: '',
    credDef: null,
    did: '',
    didNym: null,
    didDocument: null,
    formErrors: {
      schemaId: '',
      credDefId: '',
      did: '',
    },
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
    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });

    // Handle validation
    let errors = {
      schemaId: '',
      credDefId: '',
      did: '',
    };
    switch (name) {
      case 'schemaId': // schemaId: schema:mybc:did:mybc:V4SGRU86Z58d6TV7PBUe6f:2:cc:1.3
        if (this.state.schemaId.length < 1) {
          errors['schemaId'] = 'Cannot be empty';
        } else if (!this.state.schemaId.match(/^[a-zA-Z0-9:\-._]+$/)) {
          errors['schemaId'] = 'Invalid characters';
        }
        break;
      case 'credDefId': // credDefId: creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:14:TAG1
        if (this.state.credDefId.length < 1) {
          errors['credDefId'] = 'Cannot be empty';
        } else if (!this.state.credDefId.match(/^[a-zA-Z0-9:\-]+$/)) {
          errors['credDefId'] = 'Invalid characters';
        }
        break;
      case 'did': // did: did:mybc:Th7MpTaRZVRYnPiabds81Y
        if (this.state.did.length === 0) {
          errors['did'] = 'Cannot be empty';
        } else if (!this.state.did.match(/^[a-zA-Z0-9:]+$/)) {
          errors['did'] = 'Invalid characters';
        } else if (this.state.did.split(':').length !== 3) {
          errors['did'] = 'Invalid DID';
        }
        break;
      default:
        break;
    }
    this.setState({ formErrors: errors });
  };

  onSubmitGetSchema = (e) => {
    e.preventDefault();

    if (this.state.formErrors.schemaId !== '') {
      return;
    }

    const jwt = this.props.accessToken;

    axios
      .get(`${config.endpoint}/api/ledger/schema`, {
        params: {
          schemaId: this.state.schemaId,
        },
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          this.setState({ schema: res.data.schema });
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant(
          'Error getting schema from the ledger. Please try again.',
          'error'
        );
      });
  };

  onSubmitGetCredDef = (e) => {
    e.preventDefault();

    if (this.state.formErrors.credDefId !== '') {
      return;
    }

    const jwt = this.props.accessToken;

    axios
      .get(`${config.endpoint}/api/ledger/cred-def`, {
        params: {
          credDefId: this.state.credDefId,
        },
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          this.setState({ credDef: res.data.credDef });
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant(
          'Error getting credential definition from the ledger. Please try again.',
          'error'
        );
      });
  };

  onSubmitGetNym = (e) => {
    e.preventDefault();

    if (this.state.formErrors.did !== '') {
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
      <Container spacing={2} maxWidth="100%">
        <Grid container align="center">
          <Grid item xs={12} lg={5} xl={4}>
            <div style={{ marginBottom: -10 }}>
              <Typography component="span" variant="h5">
                <strong>Get Transaction</strong>
              </Typography>
            </div>
            <div className={`${classes.paper} pt-3 pb-4 px-4`}>
              <form className={classes.form} onSubmit={this.onSubmitGetSchema}>
                <Grid container align="left" spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="schemaId"
                      label="Schema ID"
                      name="schemaId"
                      placeholder="schema:mybc:did:mybc:V4SGRU86Z58d6TV7PBUe6f:2:cc:1.0"
                      value={this.state.schemaId}
                      onChange={this.handleChange}
                      InputProps={{
                        classes: {
                          input: classes.inputFontSize,
                        },
                      }}
                      error={this.state.formErrors.schemaId !== ''}
                      helperText={this.state.formErrors.schemaId}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="button"
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      onClick={this.onSubmitGetSchema}
                    >
                      Get Schema
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </div>
            <div className={`${classes.paper} pt-3 pb-4 px-4`}>
              <form className={classes.form} onSubmit={this.onSubmitGetCredDef}>
                <Grid container align="left" spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="credDefId"
                      label="Credential Definition ID"
                      name="credDefId"
                      placeholder="Leave this blank for a new random DID"
                      value={this.state.credDefId}
                      onChange={this.handleChange}
                      InputProps={{
                        classes: {
                          input: classes.inputFontSize,
                        },
                      }}
                      error={this.state.formErrors.credDefId !== ''}
                      helperText={this.state.formErrors.credDefId}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="button"
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      onClick={this.onSubmitGetCredDef}
                    >
                      Get Credential Definition
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </div>
            <div className={`${classes.paper} pt-3 pb-4 px-4`}>
              <form className={classes.form} onSubmit={this.onSubmitGetNym}>
                <Grid container align="left" spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="did"
                      label="Did"
                      name="did"
                      placeholder="did:mybc:V4SGRU86Z58d6TV7PBUe6f"
                      value={this.state.did}
                      onChange={this.handleChange}
                      InputProps={{
                        classes: {
                          input: classes.inputFontSize,
                        },
                      }}
                      error={this.state.formErrors.did !== ''}
                      helperText={this.state.formErrors.did}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="button"
                      fullWidth
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      onClick={this.onSubmitGetNym}
                    >
                      Get Nym
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </div>
          </Grid>
          <Grid item xs={12} lg={7} xl={8}>
            <div align="center" style={{ paddingLeft: 50 }}>
              {this.state.schema ? <SchemaCard schema={this.state.schema} /> : null}
              {this.state.credDef ? (
                <Card className={classes.card} align="left">
                  <div align="center">
                    <Typography component="span" variant="h6">
                      <strong>Credential Definition</strong>
                    </Typography>
                  </div>
                  <JSONPretty data={this.state.credDef}></JSONPretty>
                </Card>
              ) : null}
              {this.state.didNym ? (
                <NymCard nym={this.state.didNym} didDocument={this.state.didDocument} />
              ) : null}
            </div>
          </Grid>
        </Grid>
      </Container>
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
    maxWidth: 550,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  button: {
    height: '40px',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  formControl: {
    width: '100%',
  },
  card: {
    padding: 30,
    marginTop: 30,
    marginBottom: 15,
  },
  inputFontSize: {
    fontSize: 15,
    height: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(GetTransaction)));
