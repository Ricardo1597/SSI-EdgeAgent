import React, { Component, Fragment } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Card from '@material-ui/core/Card';
import JSONPretty from 'react-json-pretty';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../config';

class CreateCredDef extends Component {
  state = {
    dids: JSON.parse(localStorage.getItem('dids'))
      .filter((did) => did.role !== 'no role' && did.role !== null)
      .map((did) => did.did),
    did: '',
    schemaId: '',
    supportRevocation: false,
    credDef: null,
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

  handleValidation = () => {
    let errors = [];
    let formIsValid = true;

    // schemaId: schema:mybc:did:mybc:V4SGRU86Z58d6TV7PBUe6f:2:cc:1.3
    if (!this.state.schemaId.length) {
      formIsValid = false;
      errors['schemaId'] = 'Cannot be empty';
    } else if (!this.state.schemaId.match(/^[a-zA-Z0-9:\-._]+$/)) {
      formIsValid = false;
      errors['schemaId'] = 'Invalid characters';
    }

    // did: did:mybc:Th7MpTaRZVRYnPiabds81Y
    if (!this.state.did.length) {
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
      .post(
        `${config.endpoint}/api/ledger/create-cred-def`,
        {
          did: this.state.did,
          schemaId: this.state.schemaId,
          supportRevocation: this.state.supportRevocation,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        this.setState({ credDef: res.data.credDef });
        this.showSnackbarVariant('Credential definition created.', 'success');
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant(
          'Error creating credential definition. Please try again.',
          'error'
        );
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <Container spacing={2} maxWidth="100%">
        <Grid container align="center">
          <Grid item xs={12} lg={5} xl={4}>
            <div className={`${classes.paper} p-5`}>
              <Typography component="span" variant="h5">
                Create credential definition
              </Typography>
              <form className={classes.form} onSubmit={this.onSubmit}>
                <Grid container align="left" spacing={2}>
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
                  <Grid item xs={12} md={8}>
                    <FormControl variant="outlined" className={classes.formControl}>
                      <InputLabel>DID</InputLabel>
                      <Select
                        variant="outlined"
                        required
                        label="DID"
                        name="did"
                        id="did"
                        value={this.state.did}
                        onChange={this.handleChange}
                      >
                        {this.state.dids.map((did) => {
                          return (
                            <MenuItem key={did} value={did}>
                              {did}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl variant="outlined" className={classes.formControl}>
                      <InputLabel>Support Revocation</InputLabel>
                      <Select
                        variant="outlined"
                        required
                        label="Support Revocation"
                        value={this.state.supportRevocation}
                        onChange={this.handleChange}
                        inputProps={{
                          name: 'supportRevocation',
                          id: 'supportRevocation',
                        }}
                      >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </Select>
                    </FormControl>
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
                  Create Cred Def
                </Button>
              </form>
            </div>
          </Grid>
          <Grid item xs={12} lg={7} xl={8}>
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
  result: {
    margin: 30,
    display: 'flex',
    flexDirection: 'line',
    alignItems: 'center',
  },
  add: {
    height: '40px',
    marginTop: 10,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  formControl: {
    width: '100%',
  },
  card: {
    padding: 30,
    marginTop: 30,
    marginBottom: 15,
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(CreateCredDef)));
