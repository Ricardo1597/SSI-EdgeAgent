import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Typography } from '@material-ui/core';

import styled from 'styled-components';

const MyDialogContent = styled.div`
  padding: 10px 40px;
`;

export default function AddAttributeDialog({
  dialogAction,
  open,
  handleClose,
  isPredicate,
  attribute,
  isRequest,
}) {
  const [attrName, setAttrName] = useState('');
  const [attrPredicate, setAttrPredicate] = useState('<');
  const [attrValue, setAttrValue] = useState('');
  const [attrCredDefId, setAttrCredDefId] = useState('');
  const [nonRevokedFrom, setNonRevokedFrom] = useState(new Date().toISOString().split('.')[0]);
  const [nonRevokedTo, setNonRevokedTo] = useState(new Date().toISOString().split('.')[0]);
  const [checkedSchemaIssuer, setCheckedSchemaIssuer] = useState(false);
  const [checkedSchemaId, setCheckedSchemaId] = useState(false);
  const [checkedIssuerDid, setCheckedIssuerDid] = useState(false);
  const [checkedCredDefId, setCheckedCredDefId] = useState(false);
  const [schemaIssuerDid, setSchemaIssuerDid] = useState('');
  const [schemaId, setSchemaId] = useState('');
  const [issuerDid, setIssuerDid] = useState('');
  const [credDefId, setCredDefId] = useState('');
  const [formErrors, setFormErrors] = useState({
    attrName: '',
    attrPredicate: '',
    attrValue: '',
    attrCredDefId: '',
    nonRevokedFrom: '',
    nonRevokedTo: '',
    schemaIssuerDid: '',
    schemaId: '',
    issuerDid: '',
    credDefId: '',
  });

  useEffect(() => {
    if (attribute) {
      console.log('Attribute: ', attribute);
      setAttrName(attribute.name);
      setAttrPredicate(attribute.p_type);
      setAttrValue(attribute.value || attribute.p_value);
      setAttrCredDefId(attribute.cred_def_id);
      if (attribute.non_revoked) {
        setNonRevokedFrom(new Date(attribute.non_revoked.from * 1000).toISOString().split('.')[0]);
        setNonRevokedTo(new Date(attribute.non_revoked.to * 1000).toISOString().split('.')[0]);
      }
      if (attribute.restrictions && attribute.restrictions[0]) {
        if (attribute.restrictions[0].schema_issuer_did) {
          setCheckedSchemaIssuer(true);
          setSchemaIssuerDid(attribute.restrictions[0].schema_issuer_did);
        }
        if (attribute.restrictions[0].schema_id) {
          setCheckedSchemaId(true);
          setSchemaId(attribute.restrictions[0].schema_id);
        }
        if (attribute.restrictions[0].issuer_did) {
          setCheckedIssuerDid(true);
          setIssuerDid(attribute.restrictions[0].issuer_did);
        }
        if (attribute.restrictions[0].cred_def_id) {
          setCheckedCredDefId(true);
          setCredDefId(attribute.restrictions[0].cred_def_id);
        }
      }
    }
  }, [attribute]);

  // Clear all state
  const clearState = () => {
    setAttrName('');
    setAttrPredicate('<');
    setAttrValue('');
    setAttrCredDefId('');
    setCheckedSchemaIssuer(false);
    setCheckedSchemaId(false);
    setCheckedIssuerDid(false);
    setCheckedCredDefId(false);
    setSchemaIssuerDid('');
    setSchemaId('');
    setIssuerDid('');
    setCredDefId('');
    setFormErrors({
      attrName: '',
      attrPredicate: '',
      attrValue: '',
      attrCredDefId: '',
      nonRevokedFrom: '',
      nonRevokedTo: '',
      schemaIssuerDid: '',
      schemaId: '',
      issuerDid: '',
      credDefId: '',
    });
  };

  // Handle fields change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Set value and handle errors
    let errors = formErrors;
    errors[name] = '';
    switch (name) {
      case 'attrName':
        setAttrName(value);
        if (value.length < 1) {
          errors['attrName'] = 'Cannot be empty';
        } else if (!value.match(/^[a-zA-Z0-9_]+$/)) {
          errors['attrName'] = 'Invalid characters';
        }
        break;
      case 'attrValue':
        setAttrValue(value);
        if (value.length < 1) {
          errors['attrValue'] = 'Cannot be empty';
        } else if (!value.match(/^[a-zA-Z0-9:_-]+$/)) {
          errors['attrValue'] = 'Invalid characters';
        }
        break;
      case 'attrPredicate':
        setAttrPredicate(value);
        if (value.length < 1) {
          errors['attrPredicate'] = 'Cannot be empty';
        } else if (!value.match(/<|<=|=|>=|>/)) {
          errors['attrPredicate'] = 'Invalid characters';
        }
        break;
      case 'attrCredDefId': // credDefId: creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:14:TAG1
        setAttrCredDefId(value);
        if (value.length < 1) {
          errors['attrCredDefId'] = 'Cannot be empty';
        } else if (!value.match(/^[a-zA-Z0-9:_\-.]+$/)) {
          errors['attrCredDefId'] = 'Invalid characters';
        }
        break;
      case 'nonRevokedFromDate':
        setNonRevokedFrom(value + 'T' + nonRevokedFrom.split('T')[1]);
        break;
      case 'nonRevokedFromTime':
        setNonRevokedFrom(nonRevokedFrom.split('T')[0] + 'T' + value);
        break;
      case 'nonRevokedToDate':
        setNonRevokedTo(value + 'T' + nonRevokedTo.split('T')[1]);
        break;
      case 'nonRevokedToTime':
        setNonRevokedTo(nonRevokedTo.split('T')[0] + 'T' + value);
        break;
      case 'schemaIssuerDid':
        setSchemaIssuerDid(value);
        if (value.length < 1) {
          errors['schemaIssuerDid'] = 'Cannot be empty';
        } else if (!value.match(/^[a-zA-Z0-9:]+$/)) {
          errors['schemaIssuerDid'] = 'Invalid characters';
        }
        break;
      case 'schemaId':
        setSchemaId(value);
        if (value.length < 1) {
          errors['schemaId'] = 'Cannot be empty';
        } else if (!value.match(/^[a-zA-Z0-9:_\-.]+$/)) {
          errors['schemaId'] = 'Invalid characters';
        }
        break;
      case 'issuerDid':
        setIssuerDid(value);
        if (value.length < 1) {
          errors['issuerDid'] = 'Cannot be empty';
        } else if (!value.match(/^[a-zA-Z0-9:]+$/)) {
          errors['issuerDid'] = 'Invalid characters';
        }
        break;
      case 'credDefId':
        setCredDefId(value);
        if (value.length < 1) {
          errors['credDefId'] = 'Cannot be empty';
        } else if (!value.match(/^[a-zA-Z0-9:_-]+$/)) {
          errors['credDefId'] = 'Invalid characters';
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const handleAddAttr = () => {
    let attr = {};
    if (isRequest) {
      attr['non_revoked'] = {
        from: new Date(nonRevokedFrom).getTime() / 1000,
        to: new Date(nonRevokedTo).getTime() / 1000,
      };
      attr['name'] = attrName;
      if (isPredicate) {
        attr['p_type'] = attrPredicate;
        attr['p_value'] = parseInt(attrValue);
      }
      attr['restrictions'] = [];
      let restrictions = {};
      if (checkedSchemaIssuer) restrictions['schema_issuer_did'] = schemaIssuerDid;
      if (checkedSchemaId) restrictions['schema_id'] = schemaId;
      if (checkedIssuerDid) restrictions['issuer_did'] = issuerDid;
      if (checkedCredDefId) restrictions['cred_def_id'] = credDefId;
      if (Object.keys(restrictions).length) attr['restrictions'].push(restrictions);
    } else {
      attr['name'] = attrName;
      if (isPredicate) {
        attr['predicate'] = attrPredicate;
        attr['threshold'] = attrValue;
      } else {
        attr['value'] = attrValue;
      }
      attr['cred_def_id'] = attrCredDefId;
    }
    dialogAction(isPredicate, attr);
  };

  console.log('attribute: ', attribute);
  console.log('nonRevokedFrom: ', nonRevokedFrom);
  console.log('nonRevokedTo: ', nonRevokedTo);

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <div className="p-2">
          <DialogTitle id="form-dialog-title">
            {(attribute ? 'Edit ' : 'Add ') + (isPredicate ? 'Predicate' : 'Attribute')}
          </DialogTitle>
          <MyDialogContent style={{ marginTop: -10 }}>
            <DialogContentText style={{ textAlign: 'justify' }}>
              Please fill the fields presented bellow with the correct attribute information as it
              will be presented to the verifier.
            </DialogContentText>
            <Grid container spacing={2} style={{ paddingTop: 10 }}>
              <Grid item xs={isPredicate ? 5 : isRequest ? 12 : 6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Attribute"
                  name="attrName"
                  id="attrName"
                  value={attrName}
                  onChange={handleChange}
                  error={formErrors.attrName !== ''}
                  helperText={formErrors.attrName}
                />
              </Grid>
              {isPredicate ? (
                <Grid item xs={2}>
                  <FormControl error={formErrors.attrPredicate !== ''} style={{ width: '100%' }}>
                    <Select
                      variant="outlined"
                      required
                      name="attrPredicate"
                      id="attrPredicate"
                      value={attrPredicate}
                      onChange={handleChange}
                    >
                      <MenuItem key="<" value="<">
                        {'<'}
                      </MenuItem>
                      <MenuItem key="<=" value="<=">
                        {'<='}
                      </MenuItem>
                      <MenuItem key="=" value="=">
                        {'='}
                      </MenuItem>
                      <MenuItem key=">=" value=">=">
                        {'>='}
                      </MenuItem>
                      <MenuItem key=">" value=">">
                        {'>'}
                      </MenuItem>
                    </Select>
                    <FormHelperText>{formErrors.attrPredicate}</FormHelperText>
                  </FormControl>
                </Grid>
              ) : null}
              {!isRequest || isPredicate ? (
                <Grid item xs={isPredicate ? 5 : 6}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Value"
                    name="attrValue"
                    id="attrValue"
                    value={attrValue}
                    onChange={handleChange}
                    error={formErrors.attrValue !== ''}
                    helperText={formErrors.attrValue}
                  />
                </Grid>
              ) : null}
              {isRequest ? (
                <>
                  <Grid item xs={12}>
                    <Grid container spacing={4}>
                      <Grid item xs={6}>
                        <Grid container direction="column">
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              type="date"
                              label="Non Revoked (From)"
                              id="nonRevokedFromDate"
                              name="nonRevokedFromDate"
                              value={(nonRevokedFrom + '').split('T')[0]}
                              onChange={handleChange}
                              error={formErrors.nonRevokedFrom !== ''}
                              helperText={formErrors.nonRevokedFrom}
                              InputLabelProps={{
                                shrink: true,
                                focused: false,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} style={{ marginTop: -2 }}>
                            <TextField
                              fullWidth
                              type="time"
                              id="nonRevokedFromTime"
                              name="nonRevokedFromTime"
                              value={nonRevokedFrom.split('T')[1]}
                              onChange={handleChange}
                              error={formErrors.nonRevokedFrom !== ''}
                              helperText={formErrors.nonRevokedFrom}
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        <Grid container direction="column">
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              type="date"
                              label="Non Revoked (To)"
                              id="nonRevokedToDate"
                              name="nonRevokedToDate"
                              value={nonRevokedTo.split('T')[0]}
                              onChange={handleChange}
                              error={formErrors.nonRevokedTo !== ''}
                              helperText={formErrors.nonRevokedTo}
                              InputLabelProps={{
                                shrink: true,
                                focused: false,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} style={{ marginTop: -2 }}>
                            <TextField
                              fullWidth
                              type="time"
                              id="nonRevokedToTime"
                              name="nonRevokedToTime"
                              value={nonRevokedTo.split('T')[1]}
                              onChange={handleChange}
                              error={formErrors.nonRevokedTo !== ''}
                              helperText={formErrors.nonRevokedTo}
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              ) : null}
              {!isRequest ? (
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Credential Definition ID"
                    name="attrCredDefId"
                    id="attrCredDefId"
                    value={attrCredDefId}
                    onChange={handleChange}
                    error={formErrors.attrCredDefId !== ''}
                    helperText={formErrors.attrCredDefId}
                  />
                </Grid>
              ) : (
                <>
                  <div
                    style={{
                      marginTop: 10,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      align="center"
                      style={{ width: '100%', fontSize: 18, marginBottom: -5 }}
                    >
                      Restrictions
                    </Typography>

                    <FormControlLabel
                      style={{ fontSize: 12 }}
                      control={
                        <Checkbox
                          checked={checkedSchemaIssuer}
                          onChange={(e) => setCheckedSchemaIssuer(e.target.checked)}
                          name="checkedSchemaIssuer"
                          color="primary"
                        />
                      }
                      label={
                        <span style={{ fontSize: 16, marginLeft: -5, marginRight: 5 }}>
                          Schema Issuer
                        </span>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checkedSchemaId}
                          onChange={(e) => setCheckedSchemaId(e.target.checked)}
                          name="checkedSchemaId"
                          color="primary"
                        />
                      }
                      label={
                        <span style={{ fontSize: 16, marginLeft: -5, marginRight: 5 }}>
                          Schema Id
                        </span>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checkedIssuerDid}
                          onChange={(e) => setCheckedIssuerDid(e.target.checked)}
                          name="checkedIssuerDid"
                          color="primary"
                        />
                      }
                      label={
                        <span style={{ fontSize: 16, marginLeft: -5, marginRight: 5 }}>
                          Issuer DID
                        </span>
                      }
                    />

                    <FormControlLabel
                      style={{ marginRight: 0 }}
                      control={
                        <Checkbox
                          checked={checkedCredDefId}
                          onChange={(e) => setCheckedCredDefId(e.target.checked)}
                          name="checkedCredDefId"
                          color="primary"
                        />
                      }
                      label={<span style={{ fontSize: 16, marginLeft: -5 }}>Cred Def Id</span>}
                    />
                  </div>
                  <Grid container spacing={2} style={{ marginTop: -8, marginBottom: 8 }}>
                    {checkedSchemaIssuer ? (
                      <Grid item xs={12}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          label="Schema Issuer DID"
                          name="schemaIssuerDid"
                          id="schemaIssuerDid"
                          value={schemaIssuerDid}
                          onChange={handleChange}
                          error={formErrors.schemaIssuerDid !== ''}
                          helperText={formErrors.schemaIssuerDid}
                        />
                      </Grid>
                    ) : null}
                    {checkedSchemaId ? (
                      <Grid item xs={12}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          label="Schema ID"
                          name="schemaId"
                          id="schemaId"
                          value={schemaId}
                          onChange={handleChange}
                          error={formErrors.schemaId !== ''}
                          helperText={formErrors.schemaId}
                        />
                      </Grid>
                    ) : null}
                    {checkedIssuerDid ? (
                      <Grid item xs={12}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          label="Issuer DID"
                          name="issuerDid"
                          id="issuerDid"
                          value={issuerDid}
                          onChange={handleChange}
                          error={formErrors.issuerDid !== ''}
                          helperText={formErrors.issuerDid}
                        />
                      </Grid>
                    ) : null}
                    {checkedCredDefId ? (
                      <Grid item xs={12}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          label="Cred Def ID"
                          name="credDefId"
                          id="credDefId"
                          value={credDefId}
                          onChange={handleChange}
                          error={formErrors.credDefId !== ''}
                          helperText={formErrors.credDefId}
                        />
                      </Grid>
                    ) : null}
                  </Grid>
                </>
              )}
            </Grid>
          </MyDialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                clearState();
                handleClose();
              }}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                clearState();
                handleClose();
                handleAddAttr();
              }}
              color="primary"
            >
              {attribute ? 'Save changes' : 'Add attribute'}
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
}
