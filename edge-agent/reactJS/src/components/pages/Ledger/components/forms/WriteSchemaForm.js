import React, { useState, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import uuid from 'uuid';
import axios from 'axios';
import config from '../../../../../config';

import AttributesTable from '../AttributesTable';

const AddAttrButton = styled(Button)`
  margin-bottom: 10px;
  height: 38px;
`;

const MyButton = styled(Button)`
  margin-top: 20px;
`;

const MyFormControl = styled(FormControl)`
  width: 100%;
`;

const useStyles = makeStyles((theme) => ({
  input: {
    height: 40,
    fontSize: 15,
  },
}));

const CreateSchemaForm = ({ setResult, showSnackbarVariant, accessToken }) => {
  const classes = useStyles();

  const [did, setDid] = useState('');
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [dids, setDids] = useState([]);
  const [formErrors, setFormErrors] = useState({
    name: '',
    version: '',
    attributes: '',
  });
  const [attribute, setAttribute] = useState('');
  const [attributeErrors, setAttributeErrors] = useState('');

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
      case 'name':
        setName(value);
        if (!value.match(/^[a-zA-Z0-9\-_]*$/)) {
          errors['name'] = 'Invalid characters';
        }
        break;
      case 'version':
        setVersion(value);
        if (!value.match(/^[0-9.]*$/)) {
          errors['version'] = 'Invalid characters';
        }
        break;
      case 'attribute':
        setAttribute(value);
        setAttributeErrors('');
        if (value.length < 3) {
          setAttributeErrors('Must be at least 3 characters long');
        } else if (!value.match(/^[a-zA-Z0-9_]*$/)) {
          setAttributeErrors('Invalid characters');
        } else if (attributes.map((attr) => attr.name).includes(attribute)) {
          setAttributeErrors('Attribute already added');
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const onAddAttribute = () => {
    if (attributeErrors.length) {
      // There are errors
      return;
    }
    setAttributes([...attributes, { id: uuid(), name: attribute }]);
    setAttribute('');
  };

  const onEditAttribute = () => {
    alert('Edit is not yet working...');
  };

  const onDeleteAttribute = (id) => {
    setAttributes(attributes.filter((attr) => attr.id !== id));
  };

  const isFormValid = () => {
    let valid = true;

    // Not empty
    !(did.length && name.length && version.length && attributes.length) && (valid = false);

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
        `${config.endpoint}/api/ledger/create-schema`,
        {
          name: name,
          version: version,
          attributes: attributes.map((attr) => attr.name),
          did: did,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        setResult(res.data.schema);
        showSnackbarVariant('Schema created.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error creating schema. Please try again.', 'error');
      });
  };

  return (
    <form onSubmit={onSubmit}>
      <Grid container align="left" spacing={3}>
        <Grid item xs={12}>
          <MyFormControl>
            <InputLabel htmlFor="did">DID *</InputLabel>
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
        <Grid item xs={12} sm={8}>
          <TextField
            required
            fullWidth
            id="name"
            label="Name"
            name="name"
            value={name}
            onChange={handleChange}
            error={formErrors.name !== ''}
            helperText={formErrors.name}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            required
            fullWidth
            id="version"
            label="Version"
            name="version"
            value={version}
            onChange={handleChange}
            error={formErrors.version !== ''}
            helperText={formErrors.version}
          />
        </Grid>
        <Grid style={{ marginBottom: -15 }} item xs={12}>
          <Paper>
            <AttributesTable
              rows={attributes}
              width={'100%'}
              height={215}
              rowHeight={45}
              onDeleteAttribute={onDeleteAttribute}
              onEditAttribute={onEditAttribute}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} style={{ display: 'flex' }}>
          <div style={{ width: '80%' }}>
            <TextField
              variant="outlined"
              fullWidth
              id="attribute"
              placeholder="New attribute"
              name="attribute"
              value={attribute}
              onChange={handleChange}
              error={attributeErrors !== ''}
              helperText={attributeErrors}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddAttribute();
                }
              }}
              InputProps={{ className: `${classes.input}` }}
              inputProps={{ className: 'addAttrInput' }}
              InputLabelProps={{
                classes: {
                  root: {
                    fontSize: 20,
                    color: 'red',
                    '&$labelFocused': {
                      color: 'purple',
                    },
                  },
                },
              }}
            />
          </div>
          <div style={{ width: '20%' }}>
            <AddAttrButton type="button" fullWidth variant="contained" onClick={onAddAttribute}>
              Add
            </AddAttrButton>
          </div>
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

export default connect(mapStateToProps)(CreateSchemaForm);
