import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import { connect } from 'react-redux';

import axios from 'axios';
import config from '../../../../config';

const MyButton = styled(Button)`
  margin-top: 20px;
`;

const GetCredDefForm = ({ setResult, showSnackbarVariant, accessToken }) => {
  const [credDefId, setCredDefId] = useState('');
  const [formErrors, setFormErrors] = useState({
    credDefId: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle validation
    let errors = {
      credDefId: '',
    };
    switch (name) {
      case 'credDefId': // credDefId: creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:14:TAG1
        setCredDefId(value);
        if (!value.match(/^[a-zA-Z0-9:\-]*$/)) {
          errors['credDefId'] = 'Invalid characters';
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const isFormValid = () => {
    return credDefId.length && !formErrors.credDefId.length;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid()) return;

    axios
      .get(`${config.endpoint}/api/ledger/cred-def`, {
        params: {
          credDefId: credDefId,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          setResult(res.data.credDef);
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant(
          'Error getting credential definition from the ledger. Please try again.',
          'error'
        );
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <Grid container align="left" spacing={3}>
        <Grid item xs={12}>
          <TextField
            variant="standard"
            required
            fullWidth
            id="credDefId"
            label="Credential Definition ID"
            name="credDefId"
            placeholder="creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:14:TAG1"
            value={credDefId}
            onChange={handleChange}
            error={formErrors.credDefId !== ''}
            helperText={formErrors.credDefId}
          />
        </Grid>
        <Grid item xs={12}>
          <MyButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={!isFormValid()}
          >
            Submit
          </MyButton>
        </Grid>
      </Grid>
    </form>
  );
};

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(GetCredDefForm);
