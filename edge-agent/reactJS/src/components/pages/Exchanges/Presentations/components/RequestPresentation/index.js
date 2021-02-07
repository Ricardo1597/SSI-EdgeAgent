import React, { useState } from 'react';

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
import styled from 'styled-components';
import TabPanel from '../../../../../TabPanel';

import AttributesTable from '../AttributesTable';
import AttributeDialog from '../AttributeDialog';

import axios from 'axios';
import config from '../../../../../../config';

import { connect } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable } from '@fortawesome/free-solid-svg-icons';
import { faCode } from '@fortawesome/free-solid-svg-icons';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { addPresExchange } from '../../../../../../redux/actions/presExchanges';
import { getCompletedConnections, getToken } from '../../../../../../redux/selectors';

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

const proposalToRequest = (presentationProposalDict) => {
  let proposal = null;
  try {
    proposal = JSON.parse(presentationProposalDict).presentation_proposal;
  } catch (e) {
    // Do nothing
  }

  // Convert proposal format to request format
  const attributes = proposal
    ? Object.values(proposal.attributes).map((attr) => {
        const dateNow = Math.floor(new Date().getTime() / 1000);
        return {
          name: attr.name,
          non_revoked: {
            from: dateNow,
            to: dateNow,
          },
          restrictions: [],
        };
      })
    : [];
  const predicates = proposal
    ? Object.values(proposal.predicates).map((pred) => {
        const dateNow = new Date().getTime() / 1000;
        return {
          name: pred.name,
          non_revoked: {
            from: dateNow,
            to: dateNow,
          },
          restrictions: [],
        };
      })
    : [];

  return { attributes, predicates };
};

const RequestPresentation = ({
  connectionId: connId,
  recordId,
  presentationProposalDict,
  closeDialog,
  enqueueSnackbar,
  closeSnackbar,
  classes,
}) => {
  const dispatch = useDispatch();
  const [connectionId, setConnectionId] = useState(connId || '');
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [nonRevokedFrom, setNonRevokedFrom] = useState(new Date().toISOString().split('.')[0]);
  const [nonRevokedTo, setNonRevokedTo] = useState(new Date().toISOString().split('.')[0]);
  const [presentationRequest, setPresentationRequest] = useState(
    JSON.stringify(proposalToRequest(presentationProposalDict), undefined, 2)
  );
  const [formErrors, setFormErrors] = useState({
    connectionId: '',
    comment: '',
    name: '',
    nonRevokedFrom: '',
    nonRevokedTo: '',
    presentationRequest: '',
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
      const preview = JSON.parse(presentationRequest);
      attribute = isPredicate
        ? preview.predicates.find((attr) => attr.name === attrId)
        : preview.attributes.find((attr) => attr.name === attrId);
    } catch (e) {
      errors['presentationRequest'] = 'Invalid JSON object';
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
    let errors = formErrors;
    errors[name] = '';

    switch (name) {
      case 'nonRevokedFromDate':
        setNonRevokedFrom(value + 'T' + nonRevokedFrom.split('T')[1]);
        break;
      case 'nonRevokedFromTime':
        setNonRevokedFrom(nonRevokedFrom.split('T')[0] + 'T' + value);
        break;
      case 'nonRevokedToDate':
        setNonRevokedTo(value + 'T' + nonRevokedTo.split('T')[1]);
        break;
      case 'nonRevokedToTime':
        setNonRevokedTo(nonRevokedTo.split('T')[0] + 'T' + value);
        break;
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
        if (!value.match(/^[a-zA-Z0-9\u00C0-\u00ff .,]*$/)) {
          errors['comment'] = 'Invalid characters';
        }
        break;
      case 'name':
        setName(value);
        if (!value.match(/^[a-zA-Z-0-9 ]*$/)) {
          errors['name'] = 'Invalid characters';
        }
        break;
      case 'presentationRequest':
        setPresentationRequest(presentationRequest);
        if (value.length < 1) {
          setPresentationRequest(
            JSON.stringify({
              attributes: [],
              predicates: [],
            })
          );
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
      const preview = JSON.parse(presentationRequest);
      if (!preview.attributes) {
        errors['presentationRequest'] = 'Attributes field missing';
      } else if (!preview.predicates) {
        errors['presentationRequest'] = 'Predicates field missing';
      } else if (preview.attributes.length < 1 && preview.predicates.length < 1) {
        errors['presentationRequest'] = 'No attributes nor predicates were provided';
      }
      setPresentationRequest(JSON.stringify(preview, undefined, 2));
    } catch (e) {
      errors['presentationRequest'] = 'Invalid JSON object';
    } finally {
      console.log(errors);
      setFormErrors(errors);
    }
  };

  const isPreviewValid = () => {
    try {
      const request = JSON.parse(presentationRequest);
      return Array.isArray(request.attributes) && Array.isArray(request.predicates);
    } catch (e) {
      return false;
    }
  };

  const cleanJsonErrors = () => {
    setFormErrors({ ...formErrors, presentationRequest: '' });
  };

  const onAddAttr = (isPredicate, attribute) => {
    let errors = formErrors;
    try {
      let preview = JSON.parse(presentationRequest);
      isPredicate
        ? (preview.predicates = [...preview.predicates, attribute])
        : (preview.attributes = [...preview.attributes, attribute]);

      errors['presentationRequest'] = '';
      setPresentationRequest(JSON.stringify(preview, undefined, 2));
    } catch (e) {
      errors['presentationRequest'] = 'Invalid JSON object';
    }
    setFormErrors(errors);
  };

  const onDeleteAttr = (isPredicate, id) => {
    console.log('onDelete: ', id);
    console.log('isPredicate: ', isPredicate);
    let errors = formErrors;

    try {
      let preview = JSON.parse(presentationRequest);
      console.log(preview.predicates);
      console.log(preview.attributes);
      isPredicate
        ? (preview.predicates = preview.predicates.filter((attr) => attr.name !== id))
        : (preview.attributes = preview.attributes.filter((attr) => attr.name !== id));
      console.log(preview);
      errors['presentationRequest'] = '';
      setPresentationRequest(JSON.stringify(preview, undefined, 2));
    } catch (e) {
      console.log('error: ', e);
      errors['presentationRequest'] = 'Invalid JSON object';
    }
    setFormErrors(errors);
  };

  const onEditAttr = (isPredicate, attribute) => {
    let errors = formErrors;
    try {
      let preview = JSON.parse(presentationRequest);
      if (isPredicate) {
        const index = preview.predicates.findIndex((attr) => attr.id === attribute.id);
        preview.predicates[index] = attribute;
      } else {
        const index = preview.attributes.findIndex((attr) => attr.id === attribute.id);
        preview.attributes[index] = attribute;
      }

      errors['presentationRequest'] = '';
      setPresentationRequest(JSON.stringify(preview, undefined, 2));
    } catch (e) {
      errors['presentationRequest'] = 'Invalid JSON object';
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

    let attrsAndPreds = JSON.parse(presentationRequest);
    let request = {
      name: name,
      non_revoked: {
        from: new Date(nonRevokedFrom).getTime() / 1000,
        to: new Date(nonRevokedTo).getTime() / 1000,
      },
    };

    request.requested_attributes = {};
    for (let i = 0; i < attrsAndPreds.attributes.length; i++) {
      const attr = attrsAndPreds.attributes[i];
      request.requested_attributes[`attribute${i + 1}`] = {
        ...attr,
        p_value: attr.p_value,
        non_revoked: {
          from: attr.non_revoked.from,
          to: attr.non_revoked.to,
        },
      };
    }

    request.requested_predicates = {};
    for (let i = 0; i < attrsAndPreds.predicates.length; i++) {
      const attr = attrsAndPreds.predicates[i];
      request.requested_predicates[`predicate${i + 1}`] = {
        ...attr,
        non_revoked: {
          from: attr.non_revoked.from,
          to: attr.non_revoked.to,
        },
      };
    }

    console.log('Request: ', request);

    !recordId
      ? axios
          .post(
            `${config.endpoint}/api/presentation-exchanges/send-request`,
            {
              connectionId: connectionId,
              comment: comment,
              presentationRequest: request,
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )
          .then(({ data: { record } }) => {
            console.log(record);
            dispatch(addPresExchange(record));
            showSnackbarVariant('Presentation request sent.', 'success');
            closeDialog();
          })
          .catch((err) => {
            console.error(err);
            showSnackbarVariant('Error sending presentation request. Please try again.', 'error');
          })
      : axios
          .post(
            `${config.endpoint}/api/presentation-exchanges/${recordId}/send-request`,
            {
              comment: comment,
              presentationRequest: JSON.parse(presentationRequest),
            },
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          )
          .then(({ data }) => {
            console.log(data);
            showSnackbarVariant('Presentation request sent.', 'success');
            closeDialog();
          })
          .catch((err) => {
            console.error(err);
            showSnackbarVariant('Error sending presentation request. Please try again.', 'error');
          });
  };

  return (
    <Container className="px-0" maxWidth="100%">
      <Grid container align="center">
        <div className={classes.outerDiv}>
          <div className={`${classes.paper} p-3`}>
            <Typography component="span" variant="h5">
              Request Presentation
            </Typography>
            <form noValidate className={classes.form} onSubmit={onSubmit}>
              <Grid container align="left" spacing={2}>
                <Grid item xs={12} style={{ marginBottom: -4 }}>
                  <FormControl error={formErrors.connectionId !== ''} style={{ width: '100%' }}>
                    <InputLabel>Connection *</InputLabel>
                    <Select
                      required
                      disabled={connId}
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
                    label="Proof Request Name"
                    name="name"
                    id="name"
                    value={name}
                    onChange={handleChange}
                    error={formErrors.name !== ''}
                    helperText={formErrors.name}
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
                            value={nonRevokedFrom.split('T')[0]}
                            onChange={handleChange}
                            error={formErrors.nonRevokedFrom !== ''}
                            helperText={formErrors.nonRevokedFrom}
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
                            value={nonRevokedFrom.split('T')[1]}
                            onChange={handleChange}
                            error={formErrors.nonRevokedFrom !== ''}
                            helperText={formErrors.nonRevokedFrom}
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
                            value={nonRevokedTo.split('T')[0]}
                            onChange={handleChange}
                            error={formErrors.nonRevokedTo !== ''}
                            helperText={formErrors.nonRevokedTo}
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
                            value={nonRevokedTo.split('T')[1]}
                            onChange={handleChange}
                            error={formErrors.nonRevokedTo !== ''}
                            helperText={formErrors.nonRevokedTo}
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
                    value={comment}
                    onChange={handleChange}
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

                <TabPanel value={tab} index={0} p={0} style={{ width: '100%' }}>
                  <Grid container spacing={2} className="p-2">
                    <Grid style={{ marginBottom: -5 }} item xs={12}>
                      <AttributesTable
                        title="Attributes"
                        columns={attributesTableColumns}
                        showHeader={true}
                        rows={isPreviewValid() ? JSON.parse(presentationRequest).attributes : []}
                        minRows={4}
                        rowHeight={40}
                        onDeleteAttribute={(id) => onDeleteAttr(false, id)}
                        onEditAttribute={(id) => handleOpenEditAttrDialog(false, id)}
                        isPredicate={false}
                        isRequest={true}
                      />
                    </Grid>
                    <Grid style={{ marginBottom: 2 }} item xs={12}>
                      <AttributesTable
                        title="Predicates"
                        columns={predicatesTableColumns}
                        showHeader={true}
                        rows={isPreviewValid() ? JSON.parse(presentationRequest).predicates : []}
                        minRows={4}
                        rowHeight={40}
                        onDeleteAttribute={(id) => onDeleteAttr(true, id)}
                        onEditAttribute={(id) => handleOpenEditAttrDialog(true, id)}
                        isPredicate={true}
                        isRequest={true}
                      />
                    </Grid>
                  </Grid>
                  <Container>
                    <Grid container align="center">
                      <Grid item xs={6}>
                        <Button
                          type="button"
                          fullWidth
                          variant="contained"
                          className={classes.add}
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
                          className={classes.add}
                          onClick={() => handleOpenAddAttrDialog(true)}
                        >
                          Add predicate
                        </Button>
                      </Grid>
                    </Grid>
                  </Container>
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
                        id="presentationRequest"
                        placeholder="You can either insert the JSON object here directly or use the buttons bellow to add attributes and predicates"
                        name="presentationRequest"
                        value={presentationRequest}
                        onChange={handleChange}
                        onBlur={handleJsonValidation}
                        onFocus={cleanJsonErrors}
                        error={formErrors.presentationRequest !== ''}
                        helperText={formErrors.presentationRequest}
                      />
                    </Grid>
                  </Grid>
                </TabPanel>
              </Grid>

              <SubmitButton
                type="button"
                fullWidth
                variant="contained"
                color="primary"
                onClick={onSubmit}
              >
                Send Request
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
          handleOpen={handleOpenAddAttrDialog}
          dialogAction={onAddAttr}
          isPredicate={isPredicate}
          isRequest={true}
        />
        <AttributeDialog
          attribute={attrToEdit}
          open={editAttrDialogOpen}
          handleClose={handleCloseEditAttrDialog}
          handleOpen={handleOpenEditAttrDialog}
          dialogAction={onEditAttr}
          isPredicate={isPredicate}
          isRequest={true}
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
    marginTop: 30,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    marginBottom: 14,
  },
  form: {
    maxWidth: '500',
    marginTop: theme.spacing(2),
  },
  formControl: {
    width: '100%',
  },
});

export default withStyles(useStyles)(withSnackbar(RequestPresentation));
