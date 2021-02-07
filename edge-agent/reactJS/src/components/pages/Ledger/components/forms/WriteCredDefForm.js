import React, { useState, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { connect } from 'react-redux';

import axios from 'axios';
import config from '../../../../../config';

const MyButton = styled(Button)`
  margin-top: 20px;
`;

const MyFormControl = styled(FormControl)`
  width: 100%;
`;

const WriteCredDefForm = ({ setResult, showSnackbarVariant, accessToken }) => {
  const [dids, setDids] = useState([]);
  const [did, setDid] = useState('');
  const [schemaId, setSchemaId] = useState('');
  const [supportRevocation, setSupportRevocation] = useState(false);
  const [formErrors, setFormErrors] = useState({
    schemaId: '',
  });

  useEffect(() => {
    setDids(
      JSON.parse(localStorage.getItem('dids'))
        .filter((did) => did.role !== 'no role' && did.role !== null)
        .map((did) => did.did)
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle validation
    let errors = formErrors;
    errors[name] = '';

    switch (name) {
      case 'schemaId': // schema:mybc:did:mybc:V4SGRU86Z58d6TV7PBUe6f:2:cc:1.3
        setSchemaId(value);
        if (!value.match(/^[a-zA-Z0-9:\-._]*$/)) {
          errors['schemaId'] = 'Invalid characters';
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const isFormValid = () => {
    let valid = true;

    // Not empty
    !schemaId.length && (valid = false);

    // No errors
    Object.values(formErrors).forEach((val) => {
      val.length && (valid = false);
    });

    return valid;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid()) return;

    axios
      .post(
        `${config.endpoint}/api/ledger/create-cred-def`,
        {
          did: did,
          schemaId: schemaId,
          supportRevocation: supportRevocation,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        setResult(res.data.credDef);
        showSnackbarVariant('Credential definition created.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error creating credential definition. Please try again.', 'error');
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <Grid container align="left" spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="schemaId"
            label="Schema ID"
            name="schemaId"
            value={schemaId}
            onChange={handleChange}
            error={formErrors.schemaId !== ''}
            helperText={formErrors.schemaId}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <MyFormControl>
            <InputLabel>DID *</InputLabel>
            <Select
              required
              label="DID"
              name="did"
              id="did"
              value={did}
              onChange={(e) => setDid(e.target.value)}
            >
              {dids.map((did) => {
                return (
                  <MenuItem key={did} value={did}>
                    {did}
                  </MenuItem>
                );
              })}
            </Select>
          </MyFormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <MyFormControl>
            <InputLabel>Revocable *</InputLabel>
            <Select
              required
              label="With Revocation"
              value={supportRevocation}
              onChange={(e) => setSupportRevocation(e.target.value)}
              inputProps={{
                name: 'supportRevocation',
                id: 'supportRevocation',
              }}
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </MyFormControl>
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

export default connect(mapStateToProps)(WriteCredDefForm);
