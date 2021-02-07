import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Dialog } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const CreateDidDialog = ({ isOpen, handleClose, onCreateDid }) => {
  const [seed, setSeed] = useState('');
  const [didAlias, setDidAlias] = useState('');
  const [formErrors, setFormErrors] = useState({
    seed: '',
    didAlias: '',
  });

  // Clear all state
  const clearState = () => {
    setSeed('');
    setDidAlias('');
    setFormErrors({
      seed: '',
      didAlias: '',
    });
  };

  const isFormValid = () => {
    let valid = true;
    Object.values(formErrors).forEach((val) => {
      val.length && (valid = false);
    });

    return valid;
  };

  // Change values and do input validation
  const handleChange = (event) => {
    // extract attribute and value from event
    const { name, value } = event.target;

    // Set value and handle errors
    let errors = formErrors;
    errors[name] = '';

    switch (name) {
      case 'seed': // example: 000000000000000000000000Steward1
        setSeed(value);
        if (value.length && value.length !== 32) {
          errors['seed'] = 'Must be empty or have exactaly 32 characters';
        } else if (!seed.match(/^[a-zA-Z0-9]*$/)) {
          errors['seed'] = 'Invalid characters';
        }
        break;
      case 'didAlias':
        setDidAlias(value);
        if (!value.length) {
          errors['didAlias'] = 'Cannot be empty';
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const handleCloseDialog = () => {
    clearState();
    handleClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleCloseDialog}>
      <div className="p-2">
        <DialogTitle id="form-dialog-title">Create a new DID</DialogTitle>
        <DialogContent className="mx-2 mb-3">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="didAlias"
                label="Alias"
                name="didAlias"
                placeholder="DID Label"
                value={didAlias}
                onChange={handleChange}
                error={formErrors.didAlias !== ''}
                helperText={formErrors.didAlias}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                fullWidth
                id="seed"
                label="Seed"
                name="seed"
                placeholder="Leave this blank for a new random DID"
                value={seed}
                onChange={handleChange}
                error={formErrors.seed !== ''}
                helperText={formErrors.seed}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseDialog();
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            disabled={!isFormValid()}
            onClick={() => {
              handleCloseDialog();
              onCreateDid(seed, didAlias);
            }}
            color="primary"
            style={{ marginRight: 20 }}
          >
            Create
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default CreateDidDialog;
