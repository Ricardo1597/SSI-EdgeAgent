import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Container from '@material-ui/core/Container';

export default function AddAttributeDialog({ onAddAttr, open, handleClose, isPredicate }) {
  const [attrName, setAttrName] = useState('');
  const [attrPredicate, setAttrPredicate] = useState('<');
  const [attrValue, setAttrValue] = useState('');
  const [attrCredDefId, setAttrCredDefId] = useState('');
  const [formErrors, setFormErrors] = useState({
    attrName: '',
    attrPredicate: '',
    attrValue: '',
    attrCredDefId: '',
  });

  // Clear all state
  const clearState = () => {
    setAttrName('');
    setAttrPredicate('<');
    setAttrValue('');
    setAttrCredDefId('');
    setFormErrors({
      attrName: '',
      attrPredicate: '',
      attrValue: '',
      attrCredDefId: '',
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
        } else if (!value.match(/^[a-zA-Z0-9:_\-]+$/)) {
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
        } else if (!value.match(/^[a-zA-Z0-9:_\-]+$/)) {
          errors['attrCredDefId'] = 'Invalid characters';
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const handleAddAttr = () => {
    isPredicate
      ? onAddAttr(true, {
          name: attrName,
          predicate: attrPredicate,
          threshold: attrValue,
          cred_def_id: attrCredDefId,
        })
      : onAddAttr(false, {
          name: attrName,
          value: attrValue,
          cred_def_id: attrCredDefId,
        });
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <div className="p-1">
          <DialogTitle id="form-dialog-title">
            {isPredicate ? 'Add Predicate' : 'Add Attribute'}
          </DialogTitle>
          <DialogContent className="mx-2" style={{ marginTop: -15 }}>
            <DialogContentText style={{ textAlign: 'justify' }}>
              Please fill the fields presented bellow with the correct attribute information as it
              will be presented to the verifier.
            </DialogContentText>
            <Grid container spacing={2} style={{ marginTop: 10 }}>
              <Grid item xs={isPredicate ? 10 : 12} sm={isPredicate ? 5 : 6}>
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
                  <FormControl error={formErrors.attrPredicate} style={{ width: '100%' }}>
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
              <Grid item xs={12} sm={isPredicate ? 5 : 6}>
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
            </Grid>
          </DialogContent>
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
              Add attribute
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
}
