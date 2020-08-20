import React, { useState, useEffect, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Container from '@material-ui/core/Container';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

export default function AttributeInfoDialog({
  attribute,
  open,
  handleClose,
  isPredicate,
  isRequest,
}) {
  console.log('attribute: ', attribute);
  return (
    <Fragment>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <div className="p-1" style={{ width: 500 }}>
          <DialogTitle id="form-dialog-title">Attribute Information</DialogTitle>
          <DialogContent className="mx-1" style={{ marginTop: -15 }}>
            {attribute ? (
              <Fragment>
                {isPredicate ? (
                  <Fragment>
                    <ListItem style={{ width: '33%', display: 'inline-block' }}>
                      <ListItemText primary="Name" secondary={attribute.name} />
                    </ListItem>
                    <ListItem style={{ width: '33%', display: 'inline-block' }}>
                      <ListItemText
                        primary="Predicate"
                        secondary={isRequest ? attribute.p_type : attribute.predicate}
                      />
                    </ListItem>
                    <ListItem style={{ width: '33%', display: 'inline-block' }}>
                      <ListItemText
                        primary="Name"
                        secondary={isRequest ? attribute.p_value : attribute.threshold}
                      />
                    </ListItem>
                  </Fragment>
                ) : (
                  <Fragment>
                    <ListItem
                      style={{
                        width: !isRequest ? '50%' : '100%',
                        display: 'inline-block',
                      }}
                    >
                      <ListItemText primary="Name" secondary={attribute.name} />
                    </ListItem>
                    {!isRequest ? (
                      <ListItem style={{ width: '50%', display: 'inline-block' }}>
                        <ListItemText primary="Value" secondary={attribute.value} />
                      </ListItem>
                    ) : null}
                  </Fragment>
                )}
                <Divider />
                {attribute.non_revoked ? (
                  <Fragment>
                    <ListItem style={{ width: '50%', display: 'inline-block' }}>
                      <ListItemText
                        primary="Non Revoked (From)"
                        secondary={attribute.non_revoked.from}
                      />
                    </ListItem>
                    <ListItem style={{ width: '50%', display: 'inline-block' }}>
                      <ListItemText
                        primary="Non Revoked (To)"
                        secondary={attribute.non_revoked.to}
                      />
                    </ListItem>
                    <Divider />
                  </Fragment>
                ) : null}
                {attribute.cred_def_id ? (
                  <Fragment>
                    <ListItem>
                      <ListItemText
                        primary="Credential Definition ID"
                        secondary={attribute.cred_def_id}
                      />
                    </ListItem>

                    <Divider />
                  </Fragment>
                ) : null}
              </Fragment>
            ) : (
              <p>No attribute received.</p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </Fragment>
  );
}
