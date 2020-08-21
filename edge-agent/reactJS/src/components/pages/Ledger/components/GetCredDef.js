import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import JSONPretty from 'react-json-pretty';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../config';

class GetCredDef extends Component {
  state = {
    credDefId: '',
    credDef: null,
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

    // credDefId: creddef:mybc:did:mybc:EbP4aYNeTHL6q385GuVpRV:3:CL:14:TAG1
    if (this.state.credDefId.length < 1) {
      formIsValid = false;
      errors['credDefId'] = 'Cannot be empty';
    } else if (!this.state.credDefId.match(/^[a-zA-Z0-9:\-]+$/)) {
      formIsValid = false;
      errors['credDefId'] = 'Invalid characters';
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
      .get(`${config.endpoint}/api/ledger/cred-def`, {
        params: {
          credDefId: this.state.credDefId,
        },
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          this.setState({ credDef: res.data.credDef });
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant(
          'Error getting credential definition from the ledger. Please try again.',
          'error'
        );
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <Grid container>
        <Grid item xs={12} lg={5}>
          <div className={classes.paper}>
            <Typography component="span" variant="h5">
              Get Credential Definition
            </Typography>
            <form className={classes.form} onSubmit={this.onSubmit}>
              <Grid container spacing={2}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="credDefId"
                  label="Credential Definition ID"
                  name="credDefId"
                  placeholder="Leave this blank for a new random DID"
                  value={this.state.credDefId}
                  onChange={this.handleChange}
                />
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={[classes.add, classes.button]}
                  onClick={this.onSubmit}
                >
                  Get Credential Definition
                </Button>
              </Grid>
            </form>
          </div>
        </Grid>
        <Grid item xs={12} lg={7}>
          {this.state.credDef ? (
            <Card className={classes.card}>
              <JSONPretty data={this.state.credDef}></JSONPretty>
            </Card>
          ) : null}
        </Grid>
      </Grid>
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
    maxWidth: 500,
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
    width: '100%',
    marginTop: theme.spacing(3),
  },
  formControl: {
    width: '100%',
  },
  card: {
    width: '500px',
    padding: 20,
    margin: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(GetCredDef)));
