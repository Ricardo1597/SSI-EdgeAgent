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

const ReadNymForm = ({ setResult, showSnackbarVariant, accessToken }) => {
  const [nym, setNym] = useState('');
  const [formErrors, setFormErrors] = useState({
    nym: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle validation
    let errors = formErrors;
    errors[name] = '';

    switch (name) {
      case 'nym': // did:mybc:Th7MpTaRZVRYnPiabds81Y
        setNym(value);
        if (!value.match(/^[a-zA-Z0-9:]*$/)) {
          errors['nym'] = 'Invalid characters';
        } else if (value.length && value.split(':').length !== 3) {
          errors['nym'] = 'Invalid DID';
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const isFormValid = () => {
    return nym.length && !formErrors.nym.length;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid()) return;

    axios
      .get(`${config.endpoint}/api/ledger/get-nym`, {
        params: {
          did: nym,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        console.log(res.data);
        setResult({ nym: res.data.did, didDocument: res.data.didDocument });
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error getting nym from the ledger. Please try again.', 'error');
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
            id="nym"
            label="Nym"
            name="nym"
            placeholder="did:mybc:Th7MpTaRZVRYnPiabds81Y"
            value={nym}
            onChange={handleChange}
            error={formErrors.nym !== ''}
            helperText={formErrors.nym}
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

export default connect(mapStateToProps)(ReadNymForm);
