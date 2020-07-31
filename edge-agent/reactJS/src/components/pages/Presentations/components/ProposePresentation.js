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
import FormHelperText from '@material-ui/core/FormHelperText';
import { withSnackbar } from 'notistack';

import { connect } from 'react-redux';

class ProposePresentation extends Component {
  state = {
    connectionId: '',
    connections: this.props.connections
      .filter((connection) => connection.state === 'complete')
      .map((connection) => {
        return {
          id: connection.connectionId,
          alias: connection.theirAlias,
        };
      }),
    comment: '',
    presentationPreview: '',
    formErrors: {},
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

    // connectionId: e0f748a8-f7b7-4970-9fa5-d2bd9872b7cd (uuid)
    if (this.state.connectionId.length < 1) {
      formIsValid = false;
      errors['connectionId'] = 'Cannot be empty';
    } else if (!this.state.connectionId.match(/^[a-z0-9-]+$/)) {
      formIsValid = false;
      errors['connectionId'] = 'Invalid characters';
    }

    // presentationPreview
    if (this.state.presentationPreview === '') {
      formIsValid = false;
      errors['presentationPreview'] = 'Cannot be empty';
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

    const jwt = this.props.accessToken;

    axios
      .post(
        `${config.endpoint}/api/presentation-exchanges/send-proposal`,
        {
          connectionId: this.state.connectionId,
          comment: this.state.comment,
          presentationPreview: JSON.parse(this.state.presentationPreview),
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          this.showSnackbarVariant('Presentation proposal sent.', 'success');
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error sending presentation proposal. Please try again.', 'error');
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <Container spacing={2}>
        <div className={classes.paper}>
          <Typography component="span" variant="h5">
            Propose Presentation
          </Typography>
          <form className={classes.form} onSubmit={this.onSubmit}>
            <Grid container align="left" className={classes.column} spacing={2}>
              <Grid item xs={12}>
                <FormControl error={this.state.formErrors.connectionId} style={{ width: '100%' }}>
                  <InputLabel>Connection *</InputLabel>
                  <Select
                    required
                    label="Connection *"
                    name="connectionId"
                    id="connectionId"
                    value={this.state.connectionId}
                    onChange={this.handleChange}
                  >
                    {this.state.connections.map(({ id, alias }) => {
                      return (
                        <MenuItem key={id} value={id}>
                          {alias || id}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <FormHelperText>{this.state.formErrors.connectionId}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  label="Comment"
                  name="comment"
                  id="comment"
                  value={this.state.comment}
                  onChange={this.handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  multiline
                  rows={10}
                  id="presentationPreview"
                  label="PresentationPreview"
                  name="presentationPreview"
                  value={this.state.presentationPreview}
                  onChange={this.handleChange}
                />
              </Grid>
            </Grid>
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={[classes.add, classes.button]}
              onClick={this.onSubmit}
            >
              Send Proposal
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
    maxWidth: '500',
    marginTop: theme.spacing(3),
  },
  column: {
    width: '500px',
  },
  formControl: {
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(ProposePresentation)));
