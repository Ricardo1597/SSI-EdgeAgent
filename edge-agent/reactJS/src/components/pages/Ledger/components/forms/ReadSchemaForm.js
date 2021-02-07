import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import { connect } from 'react-redux';

import axios from 'axios';
import config from '../../../../../config';

const MyButton = styled(Button)`
  margin-top: 20px;
`;

const ReadSchemaForm = ({ setResult, showSnackbarVariant, accessToken }) => {
  const [schemaId, setSchemaId] = useState('');
  const [formErrors, setFormErrors] = useState({
    schemaId: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle validation
    let errors = formErrors;
    errors[name] = '';

    switch (name) {
      case 'schemaId': // schemaId: schema:mybc:did:mybc:V4SGRU86Z58d6TV7PBUe6f:2:cc:1.3
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
    return schemaId.length && !formErrors.schemaId.length;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid()) return;

    axios
      .get(`${config.endpoint}/api/ledger/schema`, {
        params: {
          schemaId: schemaId,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          setResult(res.data.schema);
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error getting schema from the ledger. Please try again.', 'error');
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
            id="schemaId"
            label="Schema ID"
            name="schemaId"
            placeholder="schema:mybc:did:mybc:V4SGRU86Z58d6TV7PBUe6f:2:cc:1.0"
            value={schemaId}
            onChange={handleChange}
            error={formErrors.schemaId !== ''}
            helperText={formErrors.schemaId}
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

export default connect(mapStateToProps)(ReadSchemaForm);
