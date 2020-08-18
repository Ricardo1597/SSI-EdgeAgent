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
import JSONPretty from 'react-json-pretty';

import AttributesTable from './AttributesTable';
import AttributeDialog from './AttributeDialog';

import { connect } from 'react-redux';

import './ProposePresentation.css';

const attributesTableColumns = [
  { id: 'name', label: 'Name', width: '30%' },
  { id: 'value', label: 'Value', width: '35%' },
];

const predicatesTableColumns = [
  { id: 'name', label: 'Name', width: '26%' },
  { id: 'predicate', label: 'Predicate', width: '8%' },
  { id: 'threshold', label: 'Value', width: '31%' },
];

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
      const preview = JSON.parse(this.state.presentationPreview);
      attribute = isPredicate
        ? preview.predicates.find((attr) => attr.name === attrId)
        : preview.attributes.find((attr) => attr.name === attrId);
    } catch (e) {
      errors['presentationPreview'] = 'Invalid JSON object';
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
      case 'presentationPreview':
        if (value.length < 1) {
          this.setState({
            presentationPreview: JSON.stringify({ attributes: [], predicates: [] }),
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
      const preview = JSON.parse(this.state.presentationPreview);
      if (!preview.attributes) {
        errors['presentationPreview'] = 'Attributes field missing';
      } else if (!preview.predicates) {
        errors['presentationPreview'] = 'Predicates field missing';
      } else if (preview.attributes.length < 1 && preview.predicates.length < 1) {
        errors['presentationPreview'] = 'No attributes nor predicates were provided';
      }
      this.setState({ presentationPreview: JSON.stringify(preview, undefined, 2) });
    } catch (e) {
      errors['presentationPreview'] = 'Invalid JSON object';
    } finally {
      console.log(errors);
      this.setState({ formErrors: errors });
    }
  };

  isPreviewValid = () => {
    try {
      JSON.parse(this.state.presentationPreview);
    } catch (e) {
      return false;
    }
    return true;
  };

  cleanJsonErrors = () => {
    let errors = this.state.formErrors;
    errors['presentationPreview'] = '';
    this.setState({ formErrors: errors });
  };

  onAddAttr = (isPredicate, attribute) => {
    let errors = this.state.formErrors;
    try {
      let preview = JSON.parse(this.state.presentationPreview);
      isPredicate
        ? (preview.predicates = [...preview.predicates, attribute])
        : (preview.attributes = [...preview.attributes, attribute]);

      errors['presentationPreview'] = '';
      this.setState({ presentationPreview: JSON.stringify(preview, undefined, 2) });
    } catch (e) {
      errors['presentationPreview'] = 'Invalid JSON object';
    }
    this.setState({ formErrors: errors });
  };

  onDeleteAttr = (isPredicate, id) => {
    console.log('onDelete: ', id);
    console.log('isPredicate: ', isPredicate);
    let errors = this.state.formErrors;

    try {
      let preview = JSON.parse(this.state.presentationPreview);
      console.log(preview.predicates);
      console.log(preview.attributes);
      isPredicate
        ? (preview.predicates = preview.predicates.filter((attr) => attr.name !== id))
        : (preview.attributes = preview.attributes.filter((attr) => attr.name !== id));
      console.log(preview);
      errors['presentationPreview'] = '';
      this.setState({ presentationPreview: JSON.stringify(preview, undefined, 2) });
    } catch (e) {
      console.log('error: ', e);
      errors['presentationPreview'] = 'Invalid JSON object';
    }
    this.setState({ formErrors: errors });
  };

  onEditAttr = (isPredicate, attribute) => {
    let errors = this.state.formErrors;
    try {
      let preview = JSON.parse(this.state.presentationPreview);
      if (isPredicate) {
        const index = preview.predicates.findIndex((attr) => attr.id === attribute.id);
        preview.predicates[index] = attribute;
      } else {
        const index = preview.attributes.findIndex((attr) => attr.id === attribute.id);
        preview.attributes[index] = attribute;
      }

      errors['presentationPreview'] = '';
      this.setState({ presentationPreview: JSON.stringify(preview, undefined, 2) });
    } catch (e) {
      errors['presentationPreview'] = 'Invalid JSON object';
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
    console.log('state: ', this.state);

    return (
      <Container spacing={2} className="px-0" maxWidth="100%">
        <Grid container align="center">
          <div className={classes.outerDiv}>
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
                  <Grid style={{ marginBottom: -7 }} item xs={12}>
                    <Paper className={classes.root}>
                      <AttributesTable
                        title="Attributes"
                        columns={attributesTableColumns}
                        showHeader={true}
                        rows={
                          this.isPreviewValid()
                            ? JSON.parse(this.state.presentationPreview).attributes
                            : []
                        }
                        minRows={3}
                        width={'100%'}
                        rowHeight={40}
                        onDeleteAttribute={(id) => this.onDeleteAttr(false, id)}
                        onEditAttribute={(id) => this.handleOpenEditAttrDialog(false, id)}
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
                            ? JSON.parse(this.state.presentationPreview).predicates
                            : []
                        }
                        minRows={3}
                        width={'100%'}
                        rowHeight={40}
                        onDeleteAttribute={(id) => this.onDeleteAttr(true, id)}
                        onEditAttribute={(id) => this.handleOpenEditAttrDialog(true, id)}
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
                  Send Proposal
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
                    rows={27}
                    id="presentationPreview"
                    placeholder="You can either insert the JSON object here directly or use the buttons bellow to add attributes and predicates"
                    name="presentationPreview"
                    value={this.state.presentationPreview}
                    onChange={this.handleChange}
                    onBlur={this.handleJsonValidation}
                    onFocus={this.cleanJsonErrors}
                    error={this.state.formErrors.presentationPreview !== ''}
                    helperText={this.state.formErrors.presentationPreview}
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
          />
          <AttributeDialog
            attribute={this.state.attrToEdit}
            open={this.state.editAttrDialogOpen}
            handleClose={this.handleCloseEditAttrDialog}
            handleOpen={this.handleOpenEditAttrDialog}
            dialogAction={this.onEditAttr}
            isPredicate={this.state.isPredicate}
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
