import React, { Component, Fragment } from 'react';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
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

class RevokeCredentialDialog extends Component {
  state = {
    publish: true,
    credRevId: '',
    formErrors: {
      credRevId: '',
    },
  };

  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({ [name]: value });

    // Set value and handle errors
    let errors = this.state.formErrors;
    errors[name] = '';
    switch (name) {
      case 'credRevId':
        if (value.length < 1) {
          errors['credRevId'] = 'Cannot be empty';
        } else if (!value.match(/^[0-9]+$/)) {
          errors['credRevId'] = 'Invalid characters';
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
    if (this.state.credRevId.length < 1) {
      errors['credRevId'] = 'Cannot be empty';
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
            <DialogTitle id="form-dialog-title">Revoke Credential</DialogTitle>
            <DialogContent className="mx-2 mb-1">
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Revocation ID"
                    name="credRevId"
                    id="credRevId"
                    value={this.state.credRevId}
                    onChange={this.handleChange}
                    error={this.state.formErrors.credRevId !== ''}
                    helperText={this.state.formErrors.credRevId}
                  />
                </Grid>
                <Grid item xs={5}>
                  <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel>Publish Now</InputLabel>
                    <Select
                      variant="outlined"
                      required
                      label="Publish Now"
                      value={this.state.publish}
                      onChange={this.handleChange}
                      inputProps={{
                        name: 'publish',
                        id: 'outlined-publish-native-simple',
                      }}
                    >
                      <MenuItem value={true}>Yes</MenuItem>
                      <MenuItem value={false}>No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.props.handleClose} color="primary">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (this.isFormValid()) {
                    this.props.handleClose();

                    this.props.onRevokeCred(this.state.credRevId, this.state.publish);
                  }
                }}
                color="primary"
              >
                Revoke
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
  paper: {
    marginTop: 30,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  result: {
    margin: 30,
    display: 'flex',
    flexDirection: 'line',
    alignItems: 'center',
  },
  button: {
    '&:focus': {
      outline: 'none',
    },
  },
  add: {
    height: '40px',
    marginTop: 10,
  },
  form: {
    width: '500px',
    marginTop: theme.spacing(3),
  },
  column: {
    width: '500px',
  },
  formControl: {
    width: '100%',
  },
  card: {
    width: '200px',
    padding: 20,
    margin: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(RevokeCredentialDialog));
