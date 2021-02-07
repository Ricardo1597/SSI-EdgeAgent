import React, { useState, useEffect } from 'react';

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
import TabPanel from '../../../../../TabPanel';
import styled from 'styled-components';

import AttributesTable from '../AttributesTable';
import AttributeDialog from '../AttributeDialog';

import axios from 'axios';
import config from '../../../../../../config';

import './ProposePresentation.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable } from '@fortawesome/free-solid-svg-icons';
import { faCode } from '@fortawesome/free-solid-svg-icons';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { addPresExchange } from '../../../../../../redux/actions/presExchanges';
import { getCompletedConnections, getToken } from '../../../../../../redux/selectors';

// Text editor
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import '../../styles.css';

const IconsDiv = styled.div`
  margin: 10px 0px 0px 15px;
  width: 100%;
  text-align: center;
`;

const MyFontAwesomeIcon = styled(FontAwesomeIcon)`
  font-size: 18px;
  margin: 0px 10px;
  &:hover {
    color: #5577ee !important;
  }
  cursor: pointer;
`;

const SubmitButton = styled(Button)`
  margin-top: 30px !important;
`;

const attributesTableColumns = [
  { id: 'name', label: 'Name', width: '30%' },
  { id: 'value', label: 'Value', width: '35%' },
];

const predicatesTableColumns = [
  { id: 'name', label: 'Name', width: '26%' },
  { id: 'predicate', label: 'Predicate', width: '8%' },
  { id: 'threshold', label: 'Value', width: '31%' },
];

const ProposePresentation = ({
  connectionId: connId,
  closeDialog,
  enqueueSnackbar,
  closeSnackbar,
  classes,
}) => {
  const dispatch = useDispatch();

  const [connectionId, setConnectionId] = useState(connId);
  const [comment, setComment] = useState('');
  const [presentationPreview, setPresentationPreview] = useState(
    JSON.stringify({ attributes: [], predicates: [] }, undefined, 2)
  );
  const [formErrors, setFormErrors] = useState({
    connectionId: '',
    comment: '',
    presentationPreview: '',
  });
  const [addAttrDialogOpen, setAddAttrDialogOpen] = useState(false);
  const [editAttrDialogOpen, setEditAttrDialogOpen] = useState(false);
  const [isPredicate, setIsPredicate] = useState(false);
  const [attrToEdit, setAttrToEdit] = useState(null);
  const [tab, setTab] = useState(0);

  const connections = useSelector(getCompletedConnections).map((connection) => {
    return {
      id: connection.connectionId,
      alias: connection.theirAlias,
    };
  });
  const accessToken = useSelector(getToken);

  const showSnackbarVariant = (message, variant) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: (key) => (
        <>
          <Button
            style={{ color: 'white' }}
            onClick={() => {
              closeSnackbar(key);
            }}
          >
            <strong>Dismiss</strong>
          </Button>
        </>
      ),
    });
  };

  const handleOpenAddAttrDialog = (isPredicate) => {
    setIsPredicate(isPredicate);
    setAddAttrDialogOpen(true);
  };

  const handleCloseAddAttrDialog = () => {
    setAddAttrDialogOpen(false);
  };

  const handleOpenEditAttrDialog = (isPredicate, attrId) => {
    let errors = formErrors;
    let attribute = null;
    try {
      const preview = JSON.parse(presentationPreview);
      attribute = isPredicate
        ? preview.predicates.find((attr) => attr.name === attrId)
        : preview.attributes.find((attr) => attr.name === attrId);
    } catch (e) {
      errors['presentationPreview'] = 'Invalid JSON object';
    }
    if (attribute) {
      setIsPredicate(isPredicate);
      setEditAttrDialogOpen(true);
      setAttrToEdit(attribute);
    } else {
      showSnackbarVariant('Error finding attribute to edit. Please try again.', 'error');
    }
    setFormErrors(errors);
  };

  const handleCloseEditAttrDialog = () => {
    setEditAttrDialogOpen(false);
  };

  // Handle fields change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle errors
    let errors = formErrors;
    errors[name] = '';
    switch (name) {
      case 'connectionId': // e0f748a8-f7b7-4970-9fa5-d2bd9872b7cd (uuid)
        setConnectionId(value);
        if (value.length < 1) {
          errors['connectionId'] = 'Cannot be empty';
        } else if (!value.match(/^[a-z0-9-]+$/)) {
          errors['connectionId'] = 'Invalid characters';
        }
        break;
      case 'comment':
        setComment(value);
        if (!value.match(/^[a-zA-Z-0-9 ]*$/)) {
          errors['comment'] = 'Invalid characters';
        }
        break;
      case 'presentationPreview':
        if (value.length > 0) {
          setPresentationPreview(value);
        } else {
          setPresentationPreview(JSON.stringify({ attributes: [], predicates: [] }));
        }
        break;
      default:
        break;
    }
    setFormErrors(errors);
  };

  const handleJsonValidation = () => {
    let errors = formErrors;
    try {
      const preview = JSON.parse(presentationPreview);
      if (!preview.attributes) {
        errors['presentationPreview'] = 'Attributes field missing';
      } else if (!preview.predicates) {
        errors['presentationPreview'] = 'Predicates field missing';
      } else if (preview.attributes.length < 1 && preview.predicates.length < 1) {
        errors['presentationPreview'] = 'No attributes nor predicates were provided';
      }
      setPresentationPreview(JSON.stringify(preview, undefined, 2));
    } catch (e) {
      errors['presentationPreview'] = 'Invalid JSON object';
    } finally {
      console.log(errors);
      setFormErrors(errors);
    }
  };

  const isPreviewValid = () => {
    try {
      const preview = JSON.parse(presentationPreview);

      return Array.isArray(preview.attributes) && Array.isArray(preview.predicates);
    } catch (e) {
      return false;
    }
  };

  const cleanJsonErrors = () => {
    setFormErrors({ ...formErrors, presentationPreview: '' });
  };

  const onAddAttr = (isPredicate, attribute) => {
    let errors = formErrors;
    try {
      let preview = JSON.parse(presentationPreview);
      isPredicate
        ? (preview.predicates = [...preview.predicates, attribute])
        : (preview.attributes = [...preview.attributes, attribute]);

      errors['presentationPreview'] = '';
      setPresentationPreview(JSON.stringify(preview, undefined, 2));
    } catch (e) {
      errors['presentationPreview'] = 'Invalid JSON object';
    }
    setFormErrors(errors);
  };

  const onDeleteAttr = (isPredicate, id) => {
    console.log('onDelete: ', id);
    console.log('isPredicate: ', isPredicate);
    let errors = formErrors;

    try {
      let preview = JSON.parse(presentationPreview);
      console.log(preview.predicates);
      console.log(preview.attributes);
      isPredicate
        ? (preview.predicates = preview.predicates.filter((attr) => attr.name !== id))
        : (preview.attributes = preview.attributes.filter((attr) => attr.name !== id));
      console.log(preview);
      errors['presentationPreview'] = '';
      setPresentationPreview(JSON.stringify(preview, undefined, 2));
    } catch (e) {
      console.log('error: ', e);
      errors['presentationPreview'] = 'Invalid JSON object';
    }
    setFormErrors(errors);
  };

  const onEditAttr = (isPredicate, attribute) => {
    let errors = formErrors;
    try {
      let preview = JSON.parse(presentationPreview);
      if (isPredicate) {
        const index = preview.predicates.findIndex((attr) => attr.id === attribute.id);
        preview.predicates[index] = attribute;
      } else {
        const index = preview.attributes.findIndex((attr) => attr.id === attribute.id);
        preview.attributes[index] = attribute;
      }

      errors['presentationPreview'] = '';
      setPresentationPreview(JSON.stringify(preview, undefined, 2));
    } catch (e) {
      errors['presentationPreview'] = 'Invalid JSON object';
    }
    setFormErrors(errors);
  };

  const isFormValid = () => {
    let valid = true;
    if (connectionId.length < 1) {
      setFormErrors({ ...formErrors, connectionId: 'Cannot be empty' });
    }
    Object.values(formErrors).forEach((val) => {
      val.length && (valid = false);
    });

    return valid;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    handleJsonValidation();

    if (!isFormValid()) {
      return;
    }

    axios
      .post(
        `${config.endpoint}/api/presentation-exchanges/send-proposal`,
        {
          connectionId: connectionId,
          comment: comment,
          presentationPreview: JSON.parse(presentationPreview),
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then(({ data: { record } }) => {
        console.log(record);
        dispatch(addPresExchange(record));
        showSnackbarVariant('Presentation proposal sent.', 'success');
        closeDialog();
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error sending presentation proposal. Please try again.', 'error');
      });
  };

  return (
    <Container spacing={2} className="px-0" maxWidth="100%">
      <Grid container align="center">
        <div className={classes.outerDiv}>
          <div className={`${classes.paper} p-3`}>
            <Typography component="span" variant="h5">
              Propose Presentation
            </Typography>
            <form className={classes.form} onSubmit={onSubmit}>
              <Grid container align="left" spacing={2}>
                <Grid item xs={12}>
                  <FormControl error={formErrors.connectionId !== ''} style={{ width: '100%' }}>
                    <InputLabel>Connection *</InputLabel>
                    <Select
                      required
                      label="Connection *"
                      name="connectionId"
                      id="connectionId"
                      value={connectionId}
                      onChange={handleChange}
                    >
                      {connections.map(({ id, alias }) => {
                        return (
                          <MenuItem key={id} value={id}>
                            {alias || id}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText>{formErrors.connectionId}</FormHelperText>
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
                    value={comment}
                    onChange={handleChange}
                    error={formErrors.comment !== ''}
                    helperText={formErrors.comment}
                  />
                </Grid>
                <IconsDiv>
                  <MyFontAwesomeIcon
                    icon={faTable}
                    style={{
                      color: tab == 0 ? '#3355cc' : 'black',
                    }}
                    onClick={() => setTab(0)}
                  />
                  <MyFontAwesomeIcon
                    icon={faCode}
                    style={{
                      color: tab == 1 ? '#3355cc' : 'black',
                      marginRight: 3,
                    }}
                    onClick={() => setTab(1)}
                  />
                  <sup>(1)</sup>
                </IconsDiv>

                <TabPanel value={tab} index={0} p={0}>
                  <Grid container spacing={2} className="p-2">
                    <Grid style={{ marginBottom: -5 }} item xs={12}>
                      <AttributesTable
                        title="Attributes"
                        columns={attributesTableColumns}
                        showHeader={true}
                        rows={isPreviewValid() ? JSON.parse(presentationPreview).attributes : []}
                        minRows={4}
                        rowHeight={40}
                        onDeleteAttribute={(id) => onDeleteAttr(false, id)}
                        onEditAttribute={(id) => handleOpenEditAttrDialog(false, id)}
                        isPredicate={false}
                        isRequest={false}
                      />
                    </Grid>
                    <Grid style={{ marginBottom: 2 }} item xs={12}>
                      <AttributesTable
                        title="Predicates"
                        columns={predicatesTableColumns}
                        showHeader={true}
                        rows={isPreviewValid() ? JSON.parse(presentationPreview).predicates : []}
                        minRows={4}
                        rowHeight={40}
                        onDeleteAttribute={(id) => onDeleteAttr(true, id)}
                        onEditAttribute={(id) => handleOpenEditAttrDialog(true, id)}
                        isPredicate={true}
                        isRequest={false}
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
                            className={classes.button}
                            onClick={() => handleOpenAddAttrDialog(false)}
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
                            className={classes.button}
                            onClick={() => handleOpenAddAttrDialog(true)}
                          >
                            Add predicate
                          </Button>
                        </Grid>
                      </Grid>
                    </Container>
                  </Grid>
                </TabPanel>
                <TabPanel value={tab} index={1} p={0} style={{ width: '100%' }}>
                  <Grid container spacing={2} className="p-2">
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        multiline
                        rows={20}
                        id="presentationPreview"
                        placeholder="You can either insert the JSON object here directly or use the buttons bellow to add attributes and predicates"
                        name="presentationPreview"
                        value={presentationPreview}
                        onChange={handleChange}
                        onBlur={handleJsonValidation}
                        onFocus={cleanJsonErrors}
                        error={formErrors.presentationPreview !== ''}
                        helperText={formErrors.presentationPreview}
                      />
                    </Grid>
                  </Grid>
                  {/* <Editor
                    value={presentationPreview}
                    onValueChange={(code) => setPresentationPreview(code)}
                    highlight={(code) => highlight(code, languages.js)}
                    padding={10}
                    style={{
                      fontFamily: '"Fira code", "Fira Mono", monospace',
                      fontSize: 14,
                    }}
                  /> */}
                </TabPanel>
              </Grid>
              <SubmitButton
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                onClick={onSubmit}
              >
                Send Proposal
              </SubmitButton>
            </form>
            <div style={{ marginTop: 30, width: '100%', textAlign: 'left' }}>
              <sup>
                <sup>(1)</sup> You can also enter the attributes in a valid JSON format to save
                time!
              </sup>
            </div>
          </div>
        </div>

        <AttributeDialog
          open={addAttrDialogOpen}
          handleClose={handleCloseAddAttrDialog}
          dialogAction={onAddAttr}
          isPredicate={isPredicate}
          isRequest={false}
        />
        <AttributeDialog
          attribute={attrToEdit}
          open={editAttrDialogOpen}
          handleClose={handleCloseEditAttrDialog}
          dialogAction={onEditAttr}
          isPredicate={isPredicate}
          isRequest={false}
        />
      </Grid>
    </Container>
  );
};

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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  json: {
    margin: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 500,
    maxWidth: 900,
    backgroundColor: 'white',
    borderRadius: 5,
    height: 'calc(100% - 60px)',
  },
  button: {
    width: '90%',
    marginBottom: 15,
  },
  form: {
    marginTop: theme.spacing(3),
  },
  formControl: {
    width: '100%',
  },
});

export default withStyles(useStyles)(withSnackbar(ProposePresentation));
