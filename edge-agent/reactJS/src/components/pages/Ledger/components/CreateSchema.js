import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import AttributesTable from '../../../AttributesTable';
import Container from '@material-ui/core/Container';
import { withSnackbar } from 'notistack';

import uuid from 'uuid';

import { connect } from 'react-redux';
import axios from 'axios';
import config from '../../../../config';
import './CreateSchema.css';
import SchemaCard from './SchemaCard';

class CreateSchema extends Component {
  state = {
    name: '',
    version: '',
    attribute: '',
    attributes: [],
    did: '',
    dids: JSON.parse(localStorage.getItem('dids'))
      .filter((did) => did.role !== 'no role' && did.role !== null)
      .map((did) => did.did),
    schema: null,
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

  onAddAttribute = () => {
    if (!this.handleAttributeValidation()) {
      console.log(this.state.errors);
      return;
    }
    this.setState({
      attributes: [...this.state.attributes, { id: uuid(), name: this.state.attribute }],
      attribute: '',
    });
  };

  onEditAttribute = () => {
    alert('Edit is not yet working...');
  };

  onDeleteAttribute = (id) => {
    this.setState({
      attributes: this.state.attributes.filter((attr) => attr.id !== id),
    });
  };

  handleValidation = () => {
    let errors = [];
    let formIsValid = true;

    // name
    if (this.state.name.length === 0) {
      formIsValid = false;
      errors['name'] = 'Cannot be empty';
    } else if (!this.state.name.match(/^[a-zA-Z0-9\-_]+$/)) {
      formIsValid = false;
      errors['name'] = 'Invalid characters';
    }

    // version
    if (this.state.version.length === 0) {
      formIsValid = false;
      errors['version'] = 'Cannot be empty';
    } else if (!this.state.version.match(/^[0-9\.]+$/)) {
      formIsValid = false;
      errors['version'] = 'Invalid characters';
    }

    // did: did:mybc:Th7MpTaRZVRYnPiabds81Y
    if (this.state.did.length === 0) {
      formIsValid = false;
      errors['did'] = 'Cannot be empty';
    } else if (!this.state.did.match(/^[a-zA-Z0-9:]+$/)) {
      formIsValid = false;
      errors['did'] = 'Invalid characters';
    } else if (this.state.did.split(':').length !== 3) {
      formIsValid = false;
      errors['did'] = 'Invalid DID';
    }

    // attributes
    if (this.state.attributes.length === 0) {
      formIsValid = false;
      errors['attributes'] = 'Cannot be empty';
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
        `${config.endpoint}/api/ledger/create-schema`,
        {
          name: this.state.name,
          version: this.state.version,
          attributes: this.state.attributes.map((attr) => attr.name),
          did: this.state.did,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        this.setState({ schema: res.data.schema });
        this.showSnackbarVariant('Schema created.', 'success');
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error creating schema. Please try again.', 'error');
      });
  };

  handleAttributeValidation = () => {
    let errors = [];
    let formIsValid = true;

    // attribute
    if (this.state.attribute.length < 3) {
      formIsValid = false;
      errors['attribute'] = 'Must be at least 3 characters long';
    } else if (!this.state.attribute.match(/^[a-zA-Z0-9_]+$/)) {
      formIsValid = false;
      errors['attribute'] = 'Invalid characters';
    } else if (this.state.attributes.map((attr) => attr.name).includes(this.state.attribute)) {
      formIsValid = false;
      errors['attribute'] = 'Attribute already added';
    }

    console.log(errors);
    this.setState({ errors: errors });
    return formIsValid;
  };

  render() {
    const { classes } = this.props;

    return (
      <Container maxWidth="100%">
        <Grid container align="center">
          <Grid item xs={12} lg={5} xl={4}>
            <div className={`${classes.paper} p-5`}>
              <Typography component="span" variant="h5">
                Create Schema
              </Typography>
              <form className={classes.form} onSubmit={this.onSubmit}>
                <Grid container align="left" spacing={3}>
                  <Grid item xs={12}>
                    <FormControl className={classes.formControl}>
                      <InputLabel htmlFor="did">DID</InputLabel>
                      <Select
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
                  <Grid item xs={12} sm={8}>
                    <TextField
                      required
                      fullWidth
                      id="name"
                      label="Name"
                      name="name"
                      value={this.state.name}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      id="version"
                      label="Version"
                      name="version"
                      value={this.state.version}
                      onChange={this.handleChange}
                    />
                  </Grid>
                  <Grid style={{ marginBottom: -15 }} item xs={12}>
                    <Paper className={classes.root}>
                      <AttributesTable
                        rows={this.state.attributes}
                        width={'100%'}
                        height={215}
                        rowHeight={45}
                        onDeleteAttribute={this.onDeleteAttribute}
                        onEditAttribute={this.onEditAttribute}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} style={{ display: 'flex' }}>
                    <div style={{ width: '80%' }}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        id="attribute"
                        placeholder="New attribute"
                        name="attribute"
                        value={this.state.attribute}
                        onChange={this.handleChange}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            this.onAddAttribute();
                          }
                        }}
                        InputProps={{ className: `${classes.input}` }}
                        inputProps={{ className: 'addAttrInput' }}
                        InputLabelProps={{
                          classes: {
                            root: {
                              fontSize: 20,
                              color: 'red',
                              '&$labelFocused': {
                                color: 'purple',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    <div style={{ width: '20%' }}>
                      <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        className={classes.addAttr}
                        onClick={this.onAddAttribute}
                      >
                        Add
                      </Button>
                    </div>
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
                  Create
                </Button>
              </form>
            </div>
          </Grid>
          <Grid item xs={12} lg={7} xl={8}>
            {this.state.schema ? <SchemaCard schema={this.state.schema} /> : null}
          </Grid>
        </Grid>
      </Container>
    );
  }
}

// Styles
const useStyles = (theme) => ({
  input: {
    height: 40,
    fontSize: 15,
  },
  paper: {
    marginTop: 30,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  result: {
    margin: 30,
    display: 'flex',
    flexDirection: 'line',
    alignItems: 'center',
  },
  add: {
    height: '40px',
    marginTop: 30,
  },
  addAttr: {
    marginBottom: 10,
    height: 38,
  },
  form: {
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
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(CreateSchema)));
