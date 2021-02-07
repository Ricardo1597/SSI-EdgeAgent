import React, { useState, useEffect, Fragment } from 'react';

import axios from 'axios';
import config from '../../../../../../config';
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

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

//Redux
import { useSelector } from 'react-redux';
import { getToken } from '../../../../../../redux/selectors';

const SendPresentationDialog = ({ record, enqueueSnackbar, closeSnackbar, classes }) => {
  const [dinamicInputs, setDinamicInputs] = useState({
    requested_attributes: {},
    requested_predicates: {},
    self_attested_attributes: {},
  });
  const [credentials, setCredentials] = useState({}); // credentials that match this proof request
  const [comment, setComment] = useState(null); // If i want i can add the comment but for now it is not needed

  const accessToken = useSelector(getToken);

  useEffect(() => {
    axios
      .post(
        `${config.endpoint}/api/wallet/credentials-for-request`,
        {
          proofRequest: record.presentationRequest,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        setCredentials(res.data.credentials);
      })
      .catch((err) => {
        console.log('Error getting credentials for proof request.');
        console.error(err);
      });

    // Create fields
    let inputs = dinamicInputs;
    Object.keys(record.presentationRequest['requested_attributes'] || {}).forEach((key) => {
      inputs.requested_attributes[key] = null;
    });
    Object.keys(record.presentationRequest['requested_predicates'] || {}).forEach((key) => {
      inputs.requested_predicates[key] = null;
    });
    Object.keys(record.presentationRequest['self_attested_attributes'] || {}).forEach((key) => {
      inputs.self_attested_attributes[key] = null;
    });
    console.log(inputs);
    // setDinamicInputs(inputs);
  }, []);

  const showSnackbarVariant = (message, variant) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: (key) => (
        <Fragment>
          <Button
            style={{ color: 'white' }}
            onClick={() => {
              closeSnackbar(key);
            }}
          >
            <strong>Dismiss</strong>
          </Button>
        </Fragment>
      ),
    });
  };

  const handleChangeAttributes = (attribType, e) => {
    let inputs = dinamicInputs;
    inputs[attribType][e.target.name] = e.target.value;
    setDinamicInputs(inputs);
  };

  const isValid = () => {
    let isValid = true;
    Object.values(dinamicInputs.requested_attributes || {}).forEach((value) => {
      console.log(value != null && value != '');
      isValid = isValid && value != null && value != '';
    });
    Object.values(dinamicInputs.requested_predicates || {}).forEach((value) => {
      console.log(value != null && value != '');
      isValid = isValid && value != null && value != '';
    });
    Object.values(dinamicInputs.self_attested_attributes || {}).forEach((value) => {
      console.log(value != null && value != '');
      isValid = isValid && value != null && value != '';
    });

    return isValid;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        `${config.endpoint}/api/presentation-exchanges/${record.presentationExchangeId}/create-presentation`,
        {
          comment: comment,
          requestedAttributes: dinamicInputs,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        const valid = res.data.valid;
        if (valid) {
          console.log('Sending presentation...');
        } else if (
          window.confirm(
            'The proof you are trying to create is not valid. If you want to proceed and send the presentation click "Ok". Otherwise click "Cancel".'
          )
        ) {
          axios
            .post(
              `${config.endpoint}/api/presentation-exchanges/${record.presentationExchangeId}/send-presentation`,
              {},
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            )
            .then((res) => {
              console.log(res.data);
              showSnackbarVariant('Presentation sent', 'success');
            });
        } else {
          console.log('Presentation will not be sent');
        }
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error sending presentation. Please try again.', 'error');
      });
  };

  console.log('Inputs: ', dinamicInputs);
  console.log('1: ', record);
  if (record) console.log('1: ', record.presentationRequest);
  console.log('1: ', Object.keys(credentials).length);

  return record &&
    record.presentationExchangeId &&
    record.presentationRequest /*&&
      Object.keys(credentials).length*/ ? (
    <div className={`${classes.paper} p-3 m-4`}>
      <Typography component="span" variant="h5">
        Send Presentation
      </Typography>
      <Typography className="mt-3" component="span" variant="body">
        Select the credentials that you want to use for each required attribute
      </Typography>
      <form noValidate className={classes.form} onSubmit={onSubmit}>
        <Grid container align="left" spacing={2}>
          {Object.entries(record.presentationRequest['requested_attributes'] || {}).map(
            ([key, value]) => {
              console.log(key, value);
              return (
                <Grid item key={key} xs={12}>
                  <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel>{value.name}</InputLabel>
                    <Select
                      displayEmpty={true}
                      disabled={(Object.keys(credentials).requested_attributes || []).length}
                      required
                      label={value.name}
                      name={key}
                      id={key}
                      value={dinamicInputs.requested_attributes[key]}
                      onChange={(e) => handleChangeAttributes('requested_attributes', e)}
                    >
                      {Object.keys(credentials).length ? (
                        (credentials.requested_attributes[key] || []).map((credential) => {
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
                        <MenuItem key="empty" value="empty">
                          No credentials match this attribute.
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              );
            }
          )}
          {Object.entries(record.presentationRequest['requested_predicates'] || {}).map(
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
                      value={dinamicInputs.requested_predicates[key]}
                      onChange={(e) => handleChangeAttributes('requested_predicates', e)}
                    >
                      {Object.keys(credentials).length ? (
                        (credentials.requested_predicates[key] || []).map((credential) => {
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
          {Object.entries(record.presentationRequest['self_attested_attributes'] || {}).map(
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
                      value={dinamicInputs.self_attested_attributes[key]}
                      onChange={(e) => handleChangeAttributes('self_attested_attributes', e)}
                    >
                      {Object.keys(credentials).length &&
                        (credentials.self_attested_attributes[key] || []).map((credential) => {
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
                        })}
                    </Select>
                  </FormControl>
                </Grid>
              );
            }
          )}
        </Grid>
        <Button
          type="button"
          disabled={false}
          fullWidth
          variant="contained"
          color="primary"
          className={`${classes.button}`}
          onClick={onSubmit}
        >
          Send Presentation
        </Button>
      </form>
    </div>
  ) : null;
};

// Styles
const useStyles = (theme) => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 500,
    backgroundColor: 'white',
    borderRadius: 5,
    margin: 30,
  },
  button: {
    marginTop: 20,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  formControl: {
    width: '100%',
  },
});

export default withStyles(useStyles)(withSnackbar(SendPresentationDialog));
