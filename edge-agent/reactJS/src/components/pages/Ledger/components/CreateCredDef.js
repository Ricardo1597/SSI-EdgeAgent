import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';

import axios from 'axios';
import config from '../../../../config';

class CreateCredDef extends Component {
  state = {
    dids: JSON.parse(localStorage.getItem('dids'))
      .filter((did) => did.role !== 'no role' && did.role !== null)
      .map((did) => did.did),
    did: '',
    schemaId: '',
    supportRevocation: false,
    errors: [],
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleValidation = () => {
    let errors = [];
    let formIsValid = true;

    // schemaId: schema:mybc:did:mybc:V4SGRU86Z58d6TV7PBUe6f:2:cc:1.3
    if (!this.state.schemaId.length) {
      formIsValid = false;
      errors['schemaId'] = 'Cannot be empty';
    } else if (!this.state.schemaId.match(/^[a-zA-Z0-9:\-._]+$/)) {
      formIsValid = false;
      errors['schemaId'] = 'Invalid characters';
    }

    // did: did:mybc:Th7MpTaRZVRYnPiabds81Y
    if (!this.state.did.length) {
      formIsValid = false;
      errors['did'] = 'Cannot be empty';
    } else if (!this.state.did.match(/^[a-zA-Z0-9:]+$/)) {
      formIsValid = false;
      errors['did'] = 'Invalid characters';
    } else if (this.state.did.split(':').length !== 3) {
      formIsValid = false;
      errors['did'] = 'Invalid DID';
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
        `${config.endpoint}/api/ledger/create-cred-def`,
        {
          did: this.state.did,
          schemaId: this.state.schemaId,
          supportRevocation: this.state.supportRevocation,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
        alert('Error creating credential definition. Please try again.');
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <Grid container>
        <Grid item xs={12} lg={5}>
          <Container maxWidth="xs" spacing={2}>
            <div className={classes.paper}>
              <Typography component="span" variant="h5">
                Create credential definition
              </Typography>
              <form className={classes.form} onSubmit={this.onSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="schemaId"
                      label="Schema ID"
                      name="schemaId"
                      value={this.state.schemaId}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <FormControl variant="outlined" className={classes.formControl}>
                      <InputLabel>DID</InputLabel>
                      <Select
                        variant="outlined"
                        required
                        label="DID"
                        name="did"
                        id="did"
                        value={this.state.did}
                        onChange={this.handleChange}
                      >
                        {this.state.dids.map((did) => {
                          return (
                            <MenuItem key={did} value={did}>
                              {did}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl variant="outlined" className={classes.formControl}>
                      <InputLabel>Support Revocation</InputLabel>
                      <Select
                        variant="outlined"
                        required
                        label="Support Revocation"
                        value={this.state.supportRevocation}
                        onChange={this.handleChange}
                        inputProps={{
                          name: 'supportRevocation',
                          id: 'supportRevocation',
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
                  className={[classes.add, classes.button]}
                  onClick={this.onSubmit}
                >
                  Create Cred Def
                </Button>
              </form>
            </div>
          </Container>
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
    accessToken: state.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(CreateCredDef));
