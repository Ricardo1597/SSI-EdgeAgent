import React, { Component, Fragment } from 'react';

import axios from 'axios';
import config from '../../../../config';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withSnackbar } from 'notistack';

import { connect } from 'react-redux';

class SendPresentation extends Component {
  state = {
    proofReq: null,
    dinamicInputs: {
      requested_attributes: {},
      requested_predicates: {},
      self_attested_attributes: {},
    },
    credentials: {}, // credentials that match this proof request
    // comment: '', // If i want i can add the comment but for now it is not needed
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

  handleChangeAttributes = (attribType, e) => {
    let dinamicInputs = this.state.dinamicInputs;
    dinamicInputs[attribType][e.target.name] = e.target.value;
    this.setState({
      dinamicInputs: dinamicInputs,
    });
  };

  handleValidation = () => {
    let errors = [];
    let formIsValid = true;

    // dinamicInputs

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
        `${config.endpoint}/api/presentation-exchanges/${this.props.recordId}/create-presentation`,
        {
          comment: this.state.comment,
          requestedAttributes: this.state.dinamicInputs,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        const valid = res.data.valid;
        if (valid) {
          console.log('Sending presentation...');
        } else if (
          window.confirm(
            'The proof you are trying to create is not valid. Are you sure you want to send it?'
          )
        ) {
          console.log('Sending presentation...');
        } else {
          console.log('Presentation will not be sent');
        }
        axios
          .post(
            `${config.endpoint}/api/presentation-exchanges/${this.props.recordId}/send-presentation`,
            {},
            {
              headers: { Authorization: `Bearer ${jwt}` },
            }
          )
          .then((res) => {
            console.log(res.data);
            this.showSnackbarVariant('Presentation sent', 'success');
          });
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error sending presentation. Please try again.', 'error');
      });
  };

  componentWillMount() {
    const jwt = this.props.accessToken;

    axios
      .get(`${config.endpoint}/api/presentation-exchanges/${this.props.recordId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        console.log('data: ', res.data);
        console.log('data2: ', res.data.record.presentationRequest);
        this.setState({
          proofReq: res.data.record.presentationRequest,
        });
        axios
          .post(
            `${config.endpoint}/api/wallet/credentials-for-request`,
            {
              proofRequest: res.data.record.presentationRequest,
            },
            {
              headers: { Authorization: `Bearer ${jwt}` },
            }
          )
          .then((res) => {
            console.log(res.data);
            this.setState({
              credentials: res.data.credentials,
            });
          })
          .catch((err) => {
            console.log('Error getting credentials for proof request.');
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant(
          'Error getting credentials for proof request. Please try again.',
          'error'
        );
      });
  }

  render() {
    const { classes } = this.props;

    console.log('Inputs: ', this.state.dinamicInputs);
    console.log('1: ', this.props.recordId);
    console.log('1: ', this.state.proofReq);
    console.log('1: ', Object.keys(this.state.credentials).length);

    return this.props.recordId &&
      this.state.proofReq /*&&
      Object.keys(this.state.credentials).length*/ ? (
      <Container>
        <div className={`${classes.paper} p-5`}>
          <Typography component="span" variant="h5">
            Send Presentation
          </Typography>
          <form noValidate className={classes.form} onSubmit={this.onSubmit}>
            <Grid container align="left" spacing={2}>
              {Object.entries(this.state.proofReq['requested_attributes'] || {}).map(
                ([key, value]) => {
                  console.log(key, value);
                  return (
                    <Grid item key={key} xs={12}>
                      <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel>{value.name}</InputLabel>
                        <Select
                          displayEmpty={true}
                          disabled={
                            (Object.keys(this.state.credentials).requested_attributes || []).length
                          }
                          required
                          label={value.name}
                          name={key}
                          id={key}
                          value={this.state.dinamicInputs.requested_attributes[key]}
                          onChange={this.handleChangeAttributes.bind(this, 'requested_attributes')}
                        >
                          {Object.keys(this.state.credentials).length
                            ? (this.state.credentials.requested_attributes[key] || []).map(
                                (credential) => {
                                  return (
                                    <MenuItem
                                      key={credential.cred_info.referent}
                                      value={credential.cred_info.referent}
                                    >
                                      {`${credential.cred_info.attrs[value.name]} - ${
                                        credential.cred_info.referent
                                      }`}
                                    </MenuItem>
                                  );
                                }
                              )
                            : null}
                        </Select>
                      </FormControl>
                    </Grid>
                  );
                }
              )}
              {Object.entries(this.state.proofReq['requested_predicates'] || {}).map(
                ([key, value]) => {
                  return (
                    <Grid item key={key} xs={12}>
                      <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel>{value.name}</InputLabel>
                        <Select
                          required
                          fullWidth
                          label={value.name}
                          name={key}
                          id={key}
                          value={this.state.dinamicInputs.requested_predicates[key]}
                          onChange={this.handleChangeAttributes.bind(this, 'requested_predicates')}
                        >
                          {Object.keys(this.state.credentials).length ? (
                            this.state.credentials.requested_predicates[key].map((credential) => {
                              return (
                                <MenuItem
                                  key={credential.cred_info.referent}
                                  value={credential.cred_info.referent}
                                >
                                  {`${credential.cred_info.attrs[value.name]} - ${
                                    credential.cred_info.referent
                                  }`}
                                </MenuItem>
                              );
                            })
                          ) : (
                            <MenuItem>
                              You don't have credentials that can be used in this attribute.
                            </MenuItem>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  );
                }
              )}
              {Object.entries(this.state.proofReq['self_attested_attributes'] || {}).map(
                ([key, value]) => {
                  return (
                    <Grid item key={key} xs={12}>
                      <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel>{value.name}</InputLabel>
                        <Select
                          required
                          fullWidth
                          label={value.name}
                          name={key}
                          id={key}
                          value={this.state.dinamicInputs.self_attested_attributes[key]}
                          onChange={this.handleChangeAttributes.bind(
                            this,
                            'self_attested_attributes'
                          )}
                        >
                          {Object.keys(this.state.credentials).length &&
                            this.state.credentials.self_attested_attributes[key].map(
                              (credential) => {
                                return (
                                  <MenuItem
                                    key={credential.cred_info.referent}
                                    value={credential.cred_info.referent}
                                  >
                                    {`${credential.cred_info.attrs[value.name]} - ${
                                      credential.cred_info.referent
                                    }`}
                                  </MenuItem>
                                );
                              }
                            )}
                        </Select>
                      </FormControl>
                    </Grid>
                  );
                }
              )}
            </Grid>
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={`${classes.button}`}
              onClick={this.onSubmit}
            >
              Send Presentation
            </Button>
          </form>
        </div>
      </Container>
    ) : null;
  }
}

// Styles
const useStyles = (theme) => ({
  paper: {
    marginTop: 30,
    marginBottom: 30,
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 400,
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  button: {
    marginTop: 30,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
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

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(SendPresentation)));
