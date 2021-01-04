import React, { Component, Fragment } from 'react';

import axios from 'axios';
import config from '../../../../config';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import JSONPretty from 'react-json-pretty';
import QRCode from 'qrcode.react';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';

class CreateInvitation extends Component {
  state = {
    alias: '',
    isPublic: false,
    isMultiuse: true,
    did: '',
    invitationJson: null,
    invitationUrl: null,
    dids: JSON.parse(localStorage.getItem('dids'))
      .filter((did) => did.role !== 'no role')
      .map((did) => did.did),
    formErrors: {
      alias: '',
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

    // Handle errors
    let errors = this.state.formErrors;
    errors[name] = '';
    switch (name) {
      case 'alias':
        if (!value.match(/^[a-zA-Z0-9. ]*$/)) {
          errors['alias'] = 'Invalid characters';
        } else if (value.length < 3) {
          errors['alias'] = 'Must be at least 3 characters long';
        }
        break;
      default:
        break;
    }
    this.setState({ formErrors: errors });
  };

  changePublic = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      did: '',
      formErrors: { ...this.state.formErrors, did: '' },
    });
  };

  isFormValid = () => {
    let valid = true;
    let errors = this.state.formErrors;

    if (!this.state.alias.length) {
      valid = false;
      errors['alias'] = 'Required';
    }
    if (this.state.isPublic && !this.state.did.length) {
      valid = false;
      errors['did'] = 'Public DID required';
    }
    Object.values(this.state.formErrors).forEach((val) => {
      val.length && (valid = false);
    });

    this.setState({ formErrors: errors });
    return valid;
  };

  onSubmit = (e) => {
    e.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const jwt = this.props.accessToken;

    axios
      .post(
        `${config.endpoint}/api/connections/create-invitation`,
        {
          alias: this.state.alias,
          isPublic: this.state.isPublic,
          isMultiuse: this.state.isMultiuse,
          did: this.state.did,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          this.setState({
            invitationJson: JSON.stringify(res.data.invitation),
            invitationUrl: JSON.stringify(res.data.url),
          });
          this.showSnackbarVariant('New invitation created.', 'success');
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error creating invitation. Please try again.', 'error');
      });
  };

  render() {
    const { classes } = this.props;
    console.log(this.state);

    return (
      <Container className="px-0" style={{ height: 450, width: 500 }}>
        <Grid container align="center">
          <div className={classes.outerDiv}>
            <div className={`p-5`}>
              <Typography component="span" variant="h5">
                Create Invitation
              </Typography>
              <form className={classes.form} onSubmit={this.onSubmit}>
                <Grid container align="left" spacing={4}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="alias"
                      label="Alias"
                      name="alias"
                      value={this.state.alias}
                      onChange={this.handleChange}
                      error={this.state.formErrors.alias}
                      helperText={this.state.formErrors.alias}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl className={classes.formControl}>
                      <InputLabel>Multiuse</InputLabel>
                      <Select
                        required
                        label="Multiuse"
                        name="isMultiuse"
                        id="isMultiuse"
                        value={this.state.isMultiuse}
                        onChange={this.handleChange}
                      >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl className={classes.formControl}>
                      <InputLabel>Public</InputLabel>
                      <Select
                        required
                        label="Public"
                        value={this.state.isPublic}
                        onChange={this.changePublic}
                        inputProps={{
                          name: 'isPublic',
                          id: 'outlined-isPublic-native-simple',
                        }}
                      >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl className={classes.formControl} error={this.state.formErrors.did}>
                      <InputLabel>DID</InputLabel>
                      <Select
                        label="DID"
                        disabled={!this.state.isPublic}
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
                      <FormHelperText>{this.state.formErrors.did}</FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={this.onSubmit}
                >
                  Create Invitation
                </Button>
              </form>
            </div>
            {this.state.invitationJson ? (
              <div className={`${classes.result} p-5`}>
                <Grid container align="center">
                  <Grid item xs={12}>
                    <Typography variant="h6">Invitation Details</Typography>
                    <Fragment style={{ width: 'auto' }}>
                      <JSONPretty
                        data={this.state.invitationJson}
                        style={{ display: 'inline-block', textAlign: 'left' }}
                      ></JSONPretty>
                    </Fragment>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Invitation QRCode</Typography>
                    <QRCode value={this.state.invitationUrl} size={200} />
                  </Grid>
                </Grid>
              </div>
            ) : null}
          </div>
        </Grid>
      </Container>
    );
  }
}

// Styles
const useStyles = (theme) => ({
  outerDiv: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  result: {
    margin: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    maxWidth: 800,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  form: {
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  button: {
    height: '40px',
    marginTop: 40,
  },
  formControl: {
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(CreateInvitation)));
