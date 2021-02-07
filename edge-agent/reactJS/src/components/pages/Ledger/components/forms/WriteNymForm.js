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

const WriteNymForm = ({ setResult, showSnackbarVariant, accessToken }) => {
  const [dids, setDids] = useState([]);
  const [did, setDid] = useState('');
  const [newDid, setNewDid] = useState('');
  const [newVerkey, setNewVerkey] = useState('');
  const [role, setRole] = useState('COMMON_USER');
  const [isMyDid, setIsMyDid] = useState(false);
  const [formErrors, setFormErrors] = useState({
    newDid: '',
    newVerkey: '',
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
      case 'newDid': // (did:mybc:)?Th7MpTaRZVRYnPiabds81Y
        setNewDid(value);
        if (!value.match(/^[a-zA-Z0-9:]*$/)) {
          errors['newDid'] = 'Invalid characters';
        }
        break;
      case 'newVerkey': //
        setNewVerkey(value);
        if (!value.match(/^(~)?[a-zA-Z0-9]*$/)) {
          errors['newVerkey'] = 'Invalid characters';
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
    !(did.length && newDid.length && newVerkey.length) && (valid = false);

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
        `${config.endpoint}/api/ledger/send-nym`,
        {
          did: did,
          newDid: newDid,
          newVerKey: newVerkey,
          role: role,
          isMyDid: isMyDid,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then(({ data: { did, didDocument } }) => {
        setResult({ did: did, did_document: didDocument });
        showSnackbarVariant('Nym created.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error creating nym. Please try again.', 'error');
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <Grid container align="left" spacing={3}>
        <Grid item xs={12}>
          <MyFormControl>
            <InputLabel htmlFor="did">Supervisor DID</InputLabel>
            <Select
              required
              label="Supervisor DID"
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
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="newDid"
            label="New DID"
            name="newDid"
            value={newDid}
            onChange={handleChange}
            error={formErrors.newDid !== ''}
            helperText={formErrors.newDid}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="newVerkey"
            label="New VerKey"
            name="newVerkey"
            value={newVerkey}
            onChange={handleChange}
            error={formErrors.newVerkey !== ''}
            helperText={formErrors.newVerkey}
          />
        </Grid>
        <Grid item xs={7}>
          <MyFormControl>
            <InputLabel>Role</InputLabel>
            <Select
              required
              label="Role"
              name="role"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
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
          </MyFormControl>
        </Grid>
        <Grid item xs={5}>
          <MyFormControl>
            <InputLabel>Is In My Wallet?</InputLabel>
            <Select
              required
              label="Is In My Wallet?"
              name="isMyDid"
              id="isMyDid"
              value={isMyDid}
              onChange={(e) => setIsMyDid(e.target.value)}
            >
              <MenuItem key={0} value={true}>
                Yes
              </MenuItem>
              <MenuItem key={1} value={false}>
                No
              </MenuItem>
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

export default connect(mapStateToProps)(WriteNymForm);
