import React, { Component, Fragment } from 'react';

import axios from 'axios';
import config from '../../../../config';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import uuid from 'uuid';
import { connect } from 'react-redux';

class CreateRegistryDialog extends Component {
  state = {
    credDefId: '',
    name: '',
    issuanceByDefault: true,
    maxCredNum: '',
    formErrors: {
      credDefId: '',
      name: '',
      maxCredNum: '',
    },
  };

  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({ [name]: value });

    // Set value and handle errors
    let errors = this.state.formErrors;
    errors[name] = '';
    switch (name) {
      case 'credDefId':
        if (value.length < 1) {
          errors['credDefId'] = 'Cannot be empty';
        } else if (!value.match(/^[a-zA-Z0-9:_\-]+$/)) {
          errors['credDefId'] = 'Invalid characters';
        }
        break;
      case 'name':
        if (value.length < 1) {
          errors['name'] = 'Cannot be empty';
        } else if (!value.match(/^[a-zA-Z0-9:\ _\-]+$/)) {
          errors['name'] = 'Invalid characters';
        }
        break;
      case 'maxCredNum':
        if (value.length < 1) {
          errors['maxCredNum'] = 'Cannot be empty';
        } else if (!value.match(/^[0-9]+$/)) {
          errors['maxCredNum'] = 'Invalid characters';
        } else {
          const num = parseInt(value);
          if (num < 0) {
            errors['maxCredNum'] = 'Must be positive';
          } else if (num > 100000) {
            errors['maxCredNum'] = 'Cannot be greater than 100000';
          }
        }
        break;
      default:
        break;
    }
    this.setState({ formErrors: errors });
  };

  isFormValid = () => {
    let errors = this.state.formErrors;
    let valid = true;
    if (this.state.credDefId.length < 1) {
      errors['credDefId'] = 'Cannot be empty';
    }
    if (this.state.maxCredNum.length < 1) {
      errors['maxCredNum'] = 'Cannot be empty';
    }
    if (this.state.name.length < 1) {
      errors['name'] = 'Cannot be empty';
    }
    this.setState({ formErrors: errors });

    Object.values(this.state.formErrors).forEach((val) => {
      val.length && (valid = false);
    });

    return valid;
  };

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Dialog
          open={this.props.open}
          onClose={this.props.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <div className="p-1">
            <DialogTitle id="form-dialog-title">Create Registry</DialogTitle>
            <DialogContent className="mx-2 mb-1">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="credDefId"
                    label="Credential Definition ID"
                    name="credDefId"
                    value={this.state.credDefId}
                    onChange={this.handleChange}
                    error={this.state.formErrors.credDefId !== ''}
                    helperText={this.state.formErrors.credDefId}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Registry Name"
                    name="name"
                    id="name"
                    value={this.state.name}
                    onChange={this.handleChange}
                    error={this.state.formErrors.name !== ''}
                    helperText={this.state.formErrors.name}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel>Issuance by default</InputLabel>
                    <Select
                      variant="outlined"
                      required
                      label="Issuance by default"
                      value={this.state.issuanceByDefault}
                      onChange={this.handleChange}
                      inputProps={{
                        name: 'issuanceByDefault',
                        id: 'outlined-issuanceByDefault-native-simple',
                      }}
                    >
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Capacity"
                    name="maxCredNum"
                    id="maxCredNum"
                    value={this.state.maxCredNum}
                    onChange={this.handleChange}
                    error={this.state.formErrors.maxCredNum !== ''}
                    helperText={this.state.formErrors.maxCredNum}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  this.props.handleClose();
                }}
                color="primary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (this.isFormValid()) {
                    this.props.handleClose();

                    this.props.onCreateReg({
                      credDefId: this.state.credDefId,
                      name: this.state.name,
                      issuanceByDefault: this.state.issuanceByDefault,
                      maxCredNum: this.state.maxCredNum,
                    });
                  }
                }}
                color="primary"
              >
                Create
              </Button>
            </DialogActions>
          </div>
        </Dialog>
      </div>
    );
  }
}

// Styles
const useStyles = (theme) => ({
  formControl: {
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(CreateRegistryDialog));
