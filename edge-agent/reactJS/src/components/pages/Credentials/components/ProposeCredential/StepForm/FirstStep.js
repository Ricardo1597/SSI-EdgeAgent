import React, { Component, Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../../../config';

import { connect } from 'react-redux';

const FirstStep = ({
  handleNext,
  handleChange,
  handleChangeSchema,
  connectionId,
  connections,
  credDefId,
  comment,
  formErrors,
  accessToken,
  showSnackbarVariant,
}) => {
  const isFormValid = () => {
    let valid = true;
    Object.values(formErrors).forEach((error) => {
      error.length && (valid = false);
    });
    return valid;
  };

  const isEmpty = connectionId.length === 0 || credDefId.length === 0;

  const onNextStepClick = () => {
    const jwt = accessToken;

    axios
      .get(`${config.endpoint}/api/ledger/cred-def-with-schema`, {
        params: {
          credDefId: credDefId,
        },
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        console.log(res.data);
        handleChangeSchema(res.data.credDef.schema);
        handleNext();
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant(
          'Error finding credential definition. Please check if you have entered a valid one.',
          'error'
        );
      });
  };

  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl error={formErrors.connectionId} style={{ width: '100%' }}>
            <InputLabel>Connection *</InputLabel>
            <Select
              required
              label="Connection *"
              name="connectionId"
              id="connectionId"
              value={connectionId}
              onChange={handleChange}
            >
              {connections.map(({ id, alias }) => {
                return (
                  <MenuItem key={id} value={id}>
                    {alias || id}
                  </MenuItem>
                );
              })}
            </Select>
            <FormHelperText>{formErrors.connectionId}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="credDefId"
            label="Credential Definition ID"
            name="credDefId"
            value={credDefId}
            onChange={handleChange}
            error={formErrors.credDefId !== ''}
            helperText={formErrors.credDefId}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment"
            name="comment"
            id="comment"
            value={comment}
            onChange={handleChange}
            error={formErrors.comment !== ''}
            helperText={formErrors.comment}
          />
        </Grid>
      </Grid>
      <div style={{ display: 'flex', marginTop: 50, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          disabled={isEmpty || !isFormValid()}
          color="primary"
          onClick={onNextStepClick}
        >
          Next
        </Button>
      </div>
    </Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withSnackbar(FirstStep));
