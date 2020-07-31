import React, { Component, Fragment } from 'react';

import axios from 'axios';
import config from '../../../../config';
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
import { withSnackbar } from 'notistack';

import uuid from 'uuid';
import { connect } from 'react-redux';

class RevokeCredential extends Component {
  state = {
    revocRegId: '',
    publish: true,
    credRevId: '',
    loading: false,
    errors: [],
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
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleValidation = () => {
    let errors = [];
    let formIsValid = true;

    // revocRegId: creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:14:TAG1
    if (this.state.revocRegId.length < 1) {
      formIsValid = false;
      errors['revocRegId'] = 'Cannot be empty';
    } else if (!this.state.revocRegId.match(/^[a-zA-Z0-9:\-._]+$/)) {
      formIsValid = false;
      errors['revocRegId'] = 'Invalid characters';
    }

    if (typeof this.state.publish !== 'boolean') {
      formIsValid = false;
      errors['publish'] = 'Must be a boolean';
    }

    if (this.state.credRevId < 0) {
      formIsValid = false;
      errors['credRevId'] = 'Must be at least 0';
    } else if (this.state.credRevId > 1000000) {
      formIsValid = false;
      errors['credRevId'] = 'Must be at most 1000000';
    }

    console.log(errors);
    this.setState({ errors: errors });
    return formIsValid;
  };

  onSubmit = (e) => {
    e.preventDefault();

    if (!this.handleValidation()) {
      console.log(this.state.errors);
      return;
    }

    this.setState({ loading: true });

    const jwt = this.props.accessToken;

    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/revoke`,
        {
          revocRegId: this.state.revocRegId,
          publish: this.state.publish,
          credRevId: this.state.credRevId,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        this.showSnackbarVariant('Credential revoked.', 'success');
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error revoking credential. Please try again.', 'error');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <Container spacing={2}>
        {this.state.loading ? <p>Loading</p> : null}
        <div className={classes.paper}>
          <Typography component="span" variant="h5">
            Revoke Credential
          </Typography>
          <form noValidate className={classes.form} onSubmit={this.onSubmit2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel>Revocation Registry ID</InputLabel>
                  <Select
                    variant="outlined"
                    required
                    fullWidth
                    label="Revocation Registry ID"
                    value={this.state.revocRegId}
                    onChange={this.handleChange}
                    inputProps={{
                      name: 'revocRegId',
                      id: 'revocRegId',
                    }}
                  >
                    {this.props.myRegistries.map((registry) => {
                      return (
                        <MenuItem key={registry.recordId} value={registry.revocRegId}>
                          {registry.revocRegId}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Credential Revocation ID"
                  name="credRevId"
                  id="credRevId"
                  value={this.state.credRevId}
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel>Publish</InputLabel>
                  <Select
                    variant="outlined"
                    required
                    label="Publish"
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
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.add}
              onClick={this.onSubmit}
            >
              Revoke Credential
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

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(RevokeCredential)));
