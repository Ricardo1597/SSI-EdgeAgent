import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Container from '@material-ui/core/Container';
import { withSnackbar } from 'notistack';

import { connect } from 'react-redux';
import axios from 'axios';
import config from '../../../../config';

class CreateNym extends Component {
  state = {
    dids: JSON.parse(localStorage.getItem('dids'))
      .filter((did) => did.role !== 'no role' && did.role !== null)
      .map((did) => did.did),
    did: '',
    newDid: '',
    newVerKey: '',
    role: '',
    nym: '',
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

    // newDid: Th7MpTaRZVRYnPiabds81Y
    if (this.state.newDid.length === 0) {
      formIsValid = false;
      errors['newDid'] = 'Cannot be empty';
    } else if (!this.state.newDid.match(/^[a-zA-Z0-9]+$/)) {
      formIsValid = false;
      errors['newDid'] = 'Invalid characters';
    }

    // newVerkey: ~7TYfekw4GUagBnBVCqPjiC
    if (this.state.newVerKey.length === 0) {
      formIsValid = false;
      errors['newVerKey'] = 'Cannot be empty';
    } else if (!this.state.newVerKey.match(/^[a-zA-Z0-9~]+$/)) {
      formIsValid = false;
      errors['newVerKey'] = 'Invalid characters';
    }

    // role
    if (this.state.role.length === 0) {
      formIsValid = false;
      errors['role'] = 'Cannot be empty';
    } else if (!this.state.role.match(/^[A-Z_]+$/)) {
      formIsValid = false;
      errors['role'] = 'Invalid characters';
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
        `${config.endpoint}/api/ledger/send-nym`,
        {
          did: this.state.did,
          newDid: this.state.newDid,
          newVerKey: this.state.newVerKey,
          role: this.state.role,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        this.showSnackbarVariant('Nym created.', 'success');
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error creating nym. Please try again.', 'error');
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <Container spacing={2}>
        <Grid item xs={12} lg={5}>
          <div className={classes.paper}>
            <Typography component="span" variant="h5">
              Create Nym
            </Typography>
            <form className={classes.form} onSubmit={this.onSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel htmlFor="did">DID</InputLabel>
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
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="newDid"
                    label="New DID"
                    name="newDid"
                    value={this.state.newDid}
                    onChange={this.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="newVerKey"
                    label="New VerKey"
                    name="newVerKey"
                    value={this.state.newVerKey}
                    onChange={this.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      variant="outlined"
                      required
                      label="Role"
                      name="role"
                      id="role"
                      value={this.state.role}
                      onChange={this.handleChange}
                    >
                      <MenuItem key={0} value="COMMON_USER">
                        Common User
                      </MenuItem>
                      <MenuItem key={1} value="NETWORK_MONITOR">
                        Network Monitor
                      </MenuItem>
                      <MenuItem key={2} value="TRUST_ANCHOR">
                        Trust Anchor
                      </MenuItem>
                      <MenuItem key={3} value="STEWARD">
                        Steward
                      </MenuItem>
                      <MenuItem key={4} value="TRUSTEE">
                        Trustee
                      </MenuItem>
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
                Create
              </Button>
            </form>
          </div>
        </Grid>
        <Grid item xs={12} lg={7}>
          {this.state.nym ? (
            <Card className={classes.card}>
              <div className={classes.marginBottom}>
                <div style={{ fontWeight: 'bold' }}>DID:</div>
                {this.state.nym.dest}
              </div>
              <div className={classes.marginBottom}>
                <div style={{ fontWeight: 'bold' }}>Verkey:</div>
                {this.state.nym.verkey}
              </div>
              <div className={classes.marginBottom}>
                <div style={{ fontWeight: 'bold' }}>Role:</div>
                {this.getRole(this.state.nym.role)}
              </div>
              <div className={classes.marginBottom}>
                <div style={{ fontWeight: 'bold' }}>Added by:</div>
                {this.state.nym.identifier}
              </div>
            </Card>
          ) : null}
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
  addAttr: {
    height: 40,
    width: '100%',
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
    margin: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(CreateNym)));
