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
import JSONPretty from 'react-json-pretty';

import AddAttributeDialog from './AddAttributeDialog';

import { connect } from 'react-redux';

class ProposePresentation extends Component {
  state = {
    connectionId: '',
    connections: (this.props.connections || [])
      .filter((connection) => connection.state === 'complete')
      .map((connection) => {
        return {
          id: connection.connectionId,
          alias: connection.theirAlias,
        };
      }),
    comment: '',
    presentationPreview: JSON.stringify({ attributes: [], predicates: [] }, undefined, 2),
    formErrors: {
      connectionId: '',
      comment: '',
      presentationPreview: '',
    },
    attrDialogOpen: false,
    isPredicate: false,
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

  handleOpenAttrDialog = (isPredicate) => {
    this.setState({ isPredicate, attrDialogOpen: true });
  };

  handleCloseAttrDialog = () => {
    this.setState({ attrDialogOpen: false });
  };

  // Handle fields change
  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });

    // Handle errors
    let errors = this.state.formErrors;
    errors[name] = '';
    switch (name) {
      case 'connectionId': // e0f748a8-f7b7-4970-9fa5-d2bd9872b7cd (uuid)
        if (value.length < 1) {
          errors['connectionId'] = 'Cannot be empty';
        } else if (!value.match(/^[a-z0-9-]+$/)) {
          errors['connectionId'] = 'Invalid characters';
        }
        break;
      case 'comment':
        if (!value.match(/^[a-zA-Z-0-9 ]*$/)) {
          errors['comment'] = 'Invalid characters';
        }
        break;
      default:
        break;
    }
    this.setState({ formErrors: errors });
  };

  handleJsonValidation = () => {
    let errors = this.state.formErrors;
    try {
      const preview = JSON.parse(this.state.presentationPreview);
      console.log(preview.attributes.length);
      console.log(preview.predicates.length);
      if (!preview.attributes) {
        errors['presentationPreview'] = 'Attributes field missing';
      } else if (!preview.predicates) {
        errors['presentationPreview'] = 'Predicates field missing';
      } else if (preview.attributes.length < 1 && preview.predicates.length < 1) {
        errors['presentationPreview'] = 'No attributes nor predicates were provided';
      }
    } catch (e) {
      errors['presentationPreview'] = 'Invalid JSON object';
    } finally {
      this.setState({ formErrors: errors });
    }
  };

  cleanJsonErrors = () => {
    let errors = this.state.formErrors;
    errors['presentationPreview'] = '';
    this.setState({ formErrors: errors });
  };

  onAddAttr = (isPredicate, attribute) => {
    let preview = JSON.parse(this.state.presentationPreview);
    isPredicate
      ? (preview.predicates = [...preview.predicates, attribute])
      : (preview.attributes = [...preview.attributes, attribute]);

    let errors = this.state.formErrors;
    errors['presentationPreview'] = '';
    this.setState({
      presentationPreview: JSON.stringify(preview, undefined, 2),
      formErrors: errors,
    });
  };

  isFormValid = () => {
    let errors = this.state.formErrors;
    let valid = true;
    if (this.state.connectionId.length < 1) {
      errors['connectionId'] = 'Cannot be empty';
    }
    Object.values(this.state.formErrors).forEach((val) => {
      val.length && (valid = false);
    });

    return valid;
  };
  onSubmit = (e) => {
    e.preventDefault();

    this.handleJsonValidation();

    if (!this.isFormValid()) {
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
    console.log('formErrors: ', this.state.formErrors);

    return (
      <Container spacing={2} className="px-0" maxWidth="100%">
        <Grid container align="center">
          <Grid item md={12} lg={5} xl={4}>
            <div className={`${classes.paper} p-5`}>
              <Typography component="span" variant="h5">
                Propose Presentation
              </Typography>
              <form className={classes.form} onSubmit={this.onSubmit}>
                <Grid container align="left" spacing={2}>
                  <Grid item xs={12}>
                    <FormControl
                      error={this.state.formErrors.connectionId}
                      style={{ width: '100%' }}
                    >
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
                      fullWidth
                      multiline
                      rows={2}
                      label="Comment"
                      name="comment"
                      id="comment"
                      value={this.state.comment}
                      onChange={this.handleChange}
                      error={this.state.formErrors.comment !== ''}
                      helperText={this.state.formErrors.comment}
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
                      label="Attributes and Predicates"
                      placeholder="You can either insert the JSON object here directly or use the buttons bellow to add attributes and predicates"
                      name="presentationPreview"
                      value={this.state.presentationPreview}
                      onChange={(e) => {
                        console.log(e.target.value);
                        this.handleChange(e);
                      }}
                    />
                  </Grid>
                  <Container>
                    <Grid container align="center">
                      <Grid item xs={6}>
                        <Button
                          type="button"
                          fullWidth
                          variant="contained"
                          color="grey"
                          className={classes.add}
                          onClick={() => this.handleOpenAttrDialog(false)}
                        >
                          Add attribute
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          type="button"
                          fullWidth
                          variant="contained"
                          color="grey"
                          className={classes.add}
                          onClick={() => this.handleOpenAttrDialog(true)}
                        >
                          Add predicate
                        </Button>
                      </Grid>
                    </Grid>
                  </Container>
                </Grid>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={this.onSubmit}
                >
                  Send Proposal
                </Button>
                <AddAttributeDialog
                  open={this.state.attrDialogOpen}
                  handleClose={this.handleCloseAttrDialog}
                  handleOpen={this.handleOpenAttrDialog}
                  onAddAttr={this.onAddAttr}
                  isPredicate={this.state.isPredicate}
                />
              </form>
            </div>
          </Grid>
          <Grid item md={12} lg={7} xl={8}>
            <div className={`${classes.json} p-5`}>
              <Typography component="span" style={{ fontSize: 18 }}>
                Presentation Attributes and predicates
              </Typography>
              <Grid container align="left" spacing={2} style={{ marginTop: 10 }}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    multiline
                    rows={24}
                    id="presentationPreview"
                    placeholder="You can either insert the JSON object here directly or use the buttons bellow to add attributes and predicates"
                    name="presentationPreview"
                    value={this.state.presentationPreview}
                    onBlur={this.handleJsonValidation}
                    onFocus={this.cleanJsonErrors}
                    onChange={(e) => {
                      console.log(e.target.value);
                      this.handleChange(e);
                    }}
                    error={this.state.formErrors.presentationPreview !== ''}
                    helperText={this.state.formErrors.presentationPreview}
                  />
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
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
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  json: {
    marginLeft: 0,
    marginRight: 30,
    marginTop: 30,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 500,
    backgroundColor: 'white',
    borderRadius: 5,
    height: 'calc(100% - 60px)',
  },
  add: {
    width: 160,
    margin: 10,
    marginTop: 0,
    marginBottom: 40,
  },
  form: {
    marginTop: theme.spacing(3),
  },
  formControl: {
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
    connections: state.app.connections,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(ProposePresentation)));
