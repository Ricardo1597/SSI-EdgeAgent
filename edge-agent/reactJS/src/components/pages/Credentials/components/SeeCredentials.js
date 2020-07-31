import React, { Component, Fragment } from 'react';

import axios from 'axios';
import config from '../../../../config';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';

import { connect } from 'react-redux';
import CredentialItem from './CredentialItem';

class SeeCredential extends Component {
  state = {
    credentials: [],
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

  componentWillMount() {
    const jwt = this.props.accessToken;

    axios
      .get(`${config.endpoint}/api/wallet/credentials`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          this.setState({
            credentials: res.data.credentials,
          });
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error getting credentials. Please try again.', 'error');
      });
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <Grid container>
        {this.state.credentials.length ? (
          this.state.credentials.map((credential) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={credential.referent}>
              <CredentialItem credential={credential} />
            </Grid>
          ))
        ) : (
          <p>You don't have any credentials yet.</p>
        )}
      </Grid>
    );
  }
}

// Styles
const useStyles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(SeeCredential)));
