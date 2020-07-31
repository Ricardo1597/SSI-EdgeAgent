import React, { Component, Fragment } from 'react';

import axios from 'axios';
import config from '../../../../config';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { withSnackbar } from 'notistack';

import { connect } from 'react-redux';

class ReceiveInvitation extends Component {
  state = {
    alias: '',
    invitation: '',
    dids: JSON.parse(localStorage.getItem('dids')).map((did) => did.did),
    formErrors: {
      alias: '',
      invitation: '',
    },
  };

  showSnackbarVariant = (message, variant) => {
    this.props.enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: this.action,
    });
  };

  action = (key) => (
    <Fragment>
      <Button
        style={{ color: 'white' }}
        onClick={() => {
          this.props.closeSnackbar(key);
        }}
      >
        <strong>Dismiss</strong>
      </Button>
    </Fragment>
  );

  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });

    // Handle errors
    let errors = this.state.formErrors;
    errors[name] = '';
    switch (name) {
      case 'alias':
        if (!value.match(/^[a-zA-Z0-9 .-]*$/)) {
          errors['alias'] = 'Invalid characters';
        } else if (value.length < 3) {
          errors['alias'] = 'Must be at least 3 characters long';
        }
        break;
      case 'invitation':
        if (value.length) {
          try {
            const o = JSON.parse(value);
            if (!o && !(typeof o === 'object')) {
              errors['invitation'] = 'Invalid JSON';
            }
          } catch (e) {
            errors['invitation'] = 'Invalid JSON';
          }
        } else {
          errors['invitation'] = 'Required';
        }
        break;
      default:
        break;
    }
    this.setState({ formErrors: errors });
  };

  isFormValid = () => {
    let valid = true;
    let errors = this.state.formErrors;

    if (!this.state.alias.length) {
      valid = false;
      errors['alias'] = 'Required';
    }
    if (!this.state.invitation.length) {
      valid = false;
      errors['invitation'] = 'Required';
    }
    Object.values(this.state.formErrors).forEach((val) => {
      val.length && (valid = false);
    });

    this.setState({ formErrors: errors });
    return valid;
  };

  onSubmit = (e) => {
    e.preventDefault();

    if (!this.isFormValid()) {
      return;
    }

    const jwt = this.props.accessToken;

    axios
      .post(
        `${config.endpoint}/api/connections/receive-invitation`,
        {
          alias: this.state.alias,
          invitation: JSON.parse(this.state.invitation),
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { connection } }) => {
        this.props.addConnection(connection);
        this.showSnackbarVariant('New connection added to your pending connections!', 'info');
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error while processing invitation. Please try again.', 'error');
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <Container spacing={2}>
        <div className={classes.paper}>
          <Typography component="span" variant="h5">
            Receive invitation
          </Typography>
          <form className={classes.form} noValidate onSubmit={this.onSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="alias"
                  label="Alias"
                  name="alias"
                  value={this.state.alias}
                  onChange={this.handleChange}
                  error={this.state.formErrors.alias}
                  helperText={this.state.formErrors.alias}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  required
                  rows={10}
                  label="Invitation Details"
                  name="invitation"
                  id="invitation"
                  value={this.state.invitation}
                  onChange={this.handleChange}
                  className={classes.jsonBox}
                  error={this.state.formErrors.invitation}
                  helperText={this.state.formErrors.invitation}
                />
              </Grid>
            </Grid>
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.add}
              onClick={this.onSubmit}
            >
              Receive Invitation
            </Button>
          </form>
        </div>
      </Container>
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
  form: {
    maxWidth: '500px',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  add: {
    height: '40px',
    marginTop: 10,
  },
  jsonBox: {
    marginTop: -10,
  },
  leftMargin: {
    marginLeft: 10,
    marginBottom: -10,
  },
  formControl: {
    width: '100%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(ReceiveInvitation)));
