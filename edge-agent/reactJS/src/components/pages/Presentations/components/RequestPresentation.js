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
import Paper from '@material-ui/core/Paper';

import AttributesTable from './AttributesTable';
import AttributeDialog from './AttributeDialog';

import { connect } from 'react-redux';

const attributesTableColumns = [
  { id: 'name', label: 'Name', width: '22%' },
  { id: 'non_revoked_from', label: 'Non revoked (from)', width: '24%' },
  { id: 'non_revoked_to', label: 'Non revoked (from)', width: '24%' },
];

const predicatesTableColumns = [
  { id: 'name', label: 'Name', width: '10%' },
  { id: 'predicate', label: 'Predicate', width: '4%' },
  { id: 'threshold', label: 'Value', width: '8%' },
  { id: 'non_revoked_from', label: 'Non revoked (from)', width: '24%' },
  { id: 'non_revoked_to', label: 'Non revoked (from)', width: '24%' },
];

class RequestPresentation extends Component {
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
    name: '',
    nonRevokedFrom: new Date().toISOString().split('.')[0],
    nonRevokedTo: new Date().toISOString().split('.')[0],
    presentationRequest: JSON.stringify({ attributes: [], predicates: [] }, undefined, 2),
    formErrors: {
      connectionId: '',
      comment: '',
      name: '',
      nonRevokedFrom: '',
      nonRevokedTo: '',
      presentationRequest: '',
    },
    addAttrDialogOpen: false,
    editAttrDialogOpen: false,
    isPredicate: false,
    attrToEdit: null,
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

  handleOpenAddAttrDialog = (isPredicate) => {
    this.setState({ isPredicate, addAttrDialogOpen: true });
  };

  handleCloseAddAttrDialog = () => {
    this.setState({ addAttrDialogOpen: false });
  };

  handleOpenEditAttrDialog = (isPredicate, attrId) => {
    let errors = this.state.formErrors;
    let attribute = null;
    try {
      const preview = JSON.parse(this.state.presentationRequest);
      attribute = isPredicate
        ? preview.predicates.find((attr) => attr.name === attrId)
        : preview.attributes.find((attr) => attr.name === attrId);
    } catch (e) {
      errors['presentationRequest'] = 'Invalid JSON object';
    }
    if (attribute) {
      this.setState({
        isPredicate,
        editAttrDialogOpen: true,
        attrToEdit: attribute,
      });
    } else {
      this.showSnackbarVariant('Error finding attribute to edit. Please try again.', 'error');
    }
    this.setState({
      formErrors: errors,
    });
  };

  handleCloseEditAttrDialog = () => {
    this.setState({ editAttrDialogOpen: false });
  };

  // Handle fields change
  handleChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case 'nonRevokedFromDate':
        this.setState({ nonRevokedFrom: value + 'T' + this.state.nonRevokedFrom.split('T')[1] });
        break;
      case 'nonRevokedFromTime':
        this.setState({ nonRevokedFrom: this.state.nonRevokedFrom.split('T')[0] + 'T' + value });
        break;
      case 'nonRevokedToDate':
        this.setState({ nonRevokedTo: value + 'T' + this.state.nonRevokedTo.split('T')[1] });
        break;
      case 'nonRevokedToTime':
        this.setState({ nonRevokedTo: this.state.nonRevokedTo.split('T')[0] + 'T' + value });
        break;
      default:
        this.setState({ [name]: value });
    }
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
      case 'presentationRequest':
        if (value.length < 1) {
          this.setState({
            presentationRequest: JSON.stringify({
              attributes: [],
              predicates: [],
            }),
          });
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
      const preview = JSON.parse(this.state.presentationRequest);
      if (!preview.attributes) {
        errors['presentationRequest'] = 'Attributes field missing';
      } else if (!preview.predicates) {
        errors['presentationRequest'] = 'Predicates field missing';
      } else if (preview.attributes.length < 1 && preview.predicates.length < 1) {
        errors['presentationRequest'] = 'No attributes nor predicates were provided';
      }
      this.setState({ presentationRequest: JSON.stringify(preview, undefined, 2) });
    } catch (e) {
      errors['presentationRequest'] = 'Invalid JSON object';
    } finally {
      console.log(errors);
      this.setState({ formErrors: errors });
    }
  };

  isPreviewValid = () => {
    try {
      JSON.parse(this.state.presentationRequest);
    } catch (e) {
      return false;
    }
    return true;
  };

  cleanJsonErrors = () => {
    let errors = this.state.formErrors;
    errors['presentationRequest'] = '';
    this.setState({ formErrors: errors });
  };

  onAddAttr = (isPredicate, attribute) => {
    let errors = this.state.formErrors;
    try {
      let preview = JSON.parse(this.state.presentationRequest);
      isPredicate
        ? (preview.predicates = [...preview.predicates, attribute])
        : (preview.attributes = [...preview.attributes, attribute]);

      errors['presentationRequest'] = '';
      this.setState({ presentationRequest: JSON.stringify(preview, undefined, 2) });
    } catch (e) {
      errors['presentationRequest'] = 'Invalid JSON object';
    }
    this.setState({ formErrors: errors });
  };

  onDeleteAttr = (isPredicate, id) => {
    console.log('onDelete: ', id);
    console.log('isPredicate: ', isPredicate);
    let errors = this.state.formErrors;

    try {
      let preview = JSON.parse(this.state.presentationRequest);
      console.log(preview.predicates);
      console.log(preview.attributes);
      isPredicate
        ? (preview.predicates = preview.predicates.filter((attr) => attr.name !== id))
        : (preview.attributes = preview.attributes.filter((attr) => attr.name !== id));
      console.log(preview);
      errors['presentationRequest'] = '';
      this.setState({ presentationRequest: JSON.stringify(preview, undefined, 2) });
    } catch (e) {
      console.log('error: ', e);
      errors['presentationRequest'] = 'Invalid JSON object';
    }
    this.setState({ formErrors: errors });
  };

  onEditAttr = (isPredicate, attribute) => {
    let errors = this.state.formErrors;
    try {
      let preview = JSON.parse(this.state.presentationRequest);
      if (isPredicate) {
        const index = preview.predicates.findIndex((attr) => attr.id === attribute.id);
        preview.predicates[index] = attribute;
      } else {
        const index = preview.attributes.findIndex((attr) => attr.id === attribute.id);
        preview.attributes[index] = attribute;
      }

      errors['presentationRequest'] = '';
      this.setState({ presentationRequest: JSON.stringify(preview, undefined, 2) });
    } catch (e) {
      errors['presentationRequest'] = 'Invalid JSON object';
    }
    this.setState({ formErrors: errors });
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

    let attrsAndPreds = JSON.parse(this.state.presentationRequest);
    let request = {
      name: this.state.name,
      non_revoked: {
        from: new Date(this.state.nonRevokedFrom).getTime() / 1000,
        to: new Date(this.state.nonRevokedTo).getTime() / 1000,
      },
    };

    request.requested_attributes = {};
    for (let i = 0; i < attrsAndPreds.attributes.length; i++) {
      const attr = attrsAndPreds.attributes[i];
      request.requested_attributes[`attribute${i + 1}`] = {
        ...attr,
        non_revoked: {
          from: new Date(attr.non_revoked.from).getTime() / 1000,
          to: new Date(attr.non_revoked.to).getTime() / 1000,
        },
      };
    }

    request.requested_predicates = {};
    for (let i = 0; i < attrsAndPreds.predicates.length; i++) {
      const attr = attrsAndPreds.predicates[i];
      request.requested_predicates[`predicate${i + 1}`] = {
        ...attr,
        non_revoked: {
          from: new Date(attr.non_revoked.from).getTime() / 1000,
          to: new Date(attr.non_revoked.to).getTime() / 1000,
        },
      };
    }

    console.log('Request: ', request);
    return;

    const jwt = this.props.accessToken;

    !this.props.recordId
      ? axios
          .post(
            `${config.endpoint}/api/presentation-exchanges/send-request`,
            {
              connectionId: this.state.connectionId,
              comment: this.state.comment,
              presentationRequest: request,
            },
            {
              headers: { Authorization: `Bearer ${jwt}` },
            }
          )
          .then(({ data }) => {
            console.log(data);
            this.showSnackbarVariant('Presentation request sent.', 'success');
          })
          .catch((err) => {
            console.error(err);
            this.showSnackbarVariant(
              'Error sending presentation request. Please try again.',
              'error'
            );
          })
      : axios
          .post(
            `${config.endpoint}/api/presentation-exchanges/${this.props.recordId}/send-request`,
            {
              comment: this.state.comment,
              presentationRequest: JSON.parse(this.state.presentationRequest),
            },
            {
              headers: { Authorization: `Bearer ${jwt}` },
            }
          )
          .then(({ data }) => {
            console.log(data);
            this.showSnackbarVariant('Presentation request sent.', 'success');
          })
          .catch((err) => {
            console.error(err);
            this.showSnackbarVariant(
              'Error sending presentation request. Please try again.',
              'error'
            );
          });
  };

  render() {
    const { classes } = this.props;
    console.log('recordId: ', this.props.recordId, typeof this.props.recordId);
    console.log(this.state.connections);
    console.log(this.state.nonRevokedFrom);
    console.log(this.state.nonRevokedTo);

    return (
      <Container className="px-0" maxWidth="100%">
        <Grid container align="center">
          <div className={classes.outerDiv}>
            <div className={`${classes.paper} p-5`}>
              <Typography component="span" variant="h5">
                Request Presentation
              </Typography>
              <form noValidate className={classes.form} onSubmit={this.onSubmit}>
                <Grid container align="left" spacing={2}>
                  {!this.props.recordId ? (
                    <Grid item xs={12} style={{ marginBottom: -4 }}>
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
                  ) : null}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Proof Request Name"
                      name="name"
                      id="name"
                      value={this.state.name}
                      onChange={this.handleChange}
                      error={this.state.formErrors.name !== ''}
                      helperText={this.state.formErrors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={4}>
                      <Grid item xs={6}>
                        <Grid container direction="column">
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              type="date"
                              label="Non Revoked (From)"
                              id="nonRevokedFromDate"
                              name="nonRevokedFromDate"
                              value={this.state.nonRevokedFrom.split('T')[0]}
                              onChange={this.handleChange}
                              error={this.state.formErrors.nonRevokedFrom !== ''}
                              helperText={this.state.formErrors.nonRevokedFrom}
                              InputLabelProps={{
                                shrink: true,
                                focused: false,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} style={{ marginTop: -2 }}>
                            <TextField
                              fullWidth
                              type="time"
                              id="nonRevokedFromTime"
                              name="nonRevokedFromTime"
                              value={this.state.nonRevokedFrom.split('T')[1]}
                              onChange={this.handleChange}
                              error={this.state.formErrors.nonRevokedFrom !== ''}
                              helperText={this.state.formErrors.nonRevokedFrom}
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        <Grid container direction="column">
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              type="date"
                              label="Non Revoked (To)"
                              id="nonRevokedToDate"
                              name="nonRevokedToDate"
                              value={this.state.nonRevokedTo.split('T')[0]}
                              onChange={this.handleChange}
                              error={this.state.formErrors.nonRevokedTo !== ''}
                              helperText={this.state.formErrors.nonRevokedTo}
                              InputLabelProps={{
                                shrink: true,
                                focused: false,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} style={{ marginTop: -2 }}>
                            <TextField
                              fullWidth
                              type="time"
                              id="nonRevokedToTime"
                              name="nonRevokedToTime"
                              value={this.state.nonRevokedTo.split('T')[1]}
                              onChange={this.handleChange}
                              error={this.state.formErrors.nonRevokedTo !== ''}
                              helperText={this.state.formErrors.nonRevokedTo}
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} style={{ marginTop: -2 }}>
                    <TextField
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

                  <Grid style={{ marginBottom: -7 }} item xs={12}>
                    <Paper className={classes.root}>
                      <AttributesTable
                        title="Attributes"
                        columns={attributesTableColumns}
                        showHeader={true}
                        rows={
                          this.isPreviewValid()
                            ? JSON.parse(this.state.presentationRequest).attributes
                            : []
                        }
                        minRows={3}
                        rowHeight={40}
                        onDeleteAttribute={(id) => this.onDeleteAttr(false, id)}
                        onEditAttribute={(id) => this.handleOpenEditAttrDialog(false, id)}
                        isPredicate={false}
                        isRequest={true}
                      />
                    </Paper>
                  </Grid>
                  <Grid style={{ marginBottom: 2 }} item xs={12}>
                    <Paper className={classes.root}>
                      <AttributesTable
                        title="Predicates"
                        columns={predicatesTableColumns}
                        showHeader={true}
                        rows={
                          this.isPreviewValid()
                            ? JSON.parse(this.state.presentationRequest).predicates
                            : []
                        }
                        minRows={3}
                        rowHeight={40}
                        onDeleteAttribute={(id) => this.onDeleteAttr(true, id)}
                        onEditAttribute={(id) => this.handleOpenEditAttrDialog(true, id)}
                        isPredicate={true}
                        isRequest={true}
                      />
                    </Paper>
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
                          onClick={() => this.handleOpenAddAttrDialog(false)}
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
                          onClick={() => this.handleOpenAddAttrDialog(true)}
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
                  Send Request
                </Button>
              </form>
            </div>
            <div className={`${classes.json} jsonInput p-5`}>
              <Typography component="span" style={{ fontSize: 18 }}>
                Presentation Attributes and Predicates <sup>(1)</sup>
              </Typography>
              <Grid container align="left" spacing={2} style={{ marginTop: 10 }}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    multiline
                    rows={33}
                    id="presentationRequest"
                    placeholder="You can either insert the JSON object here directly or use the buttons bellow to add attributes and predicates"
                    name="presentationRequest"
                    value={this.state.presentationRequest}
                    onChange={this.handleChange}
                    onBlur={this.handleJsonValidation}
                    onFocus={this.cleanJsonErrors}
                    error={this.state.formErrors.presentationRequest !== ''}
                    helperText={this.state.formErrors.presentationRequest}
                  />
                  <div style={{ marginTop: 2 }}>
                    <sup>
                      <sup>(1)</sup> You can also enter the attributes in a valid JSON format to
                      save time!
                    </sup>
                  </div>
                </Grid>
              </Grid>
            </div>
          </div>

          <AttributeDialog
            open={this.state.addAttrDialogOpen}
            handleClose={this.handleCloseAddAttrDialog}
            handleOpen={this.handleOpenAddAttrDialog}
            dialogAction={this.onAddAttr}
            isPredicate={this.state.isPredicate}
            isRequest={true}
          />
          <AttributeDialog
            attribute={this.state.attrToEdit}
            open={this.state.editAttrDialogOpen}
            handleClose={this.handleCloseEditAttrDialog}
            handleOpen={this.handleOpenEditAttrDialog}
            dialogAction={this.onEditAttr}
            isPredicate={this.state.isPredicate}
            isRequest={true}
          />
        </Grid>
      </Container>
    );
  }
}

// Styles
const useStyles = (theme) => ({
  outerDiv: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  paper: {
    margin: 30,
    marginTop: 30,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 400,
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  json: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 30,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 500,
    maxWidth: 900,
    backgroundColor: 'white',
    borderRadius: 5,
    height: 'calc(100% - 60px)',
  },
  add: {
    width: '90%',
    marginTop: 0,
    marginBottom: 40,
  },
  form: {
    maxWidth: '500',
    marginTop: theme.spacing(2),
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

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(RequestPresentation)));
