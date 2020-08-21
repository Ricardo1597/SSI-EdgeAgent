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
import Card from '@material-ui/core/Card';
import JSONPretty from 'react-json-pretty';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

export default function RowInfoDialog({ registryInfo, open, handleClose }) {
  console.log('registryInfo: ', registryInfo);
  return (
    <Fragment>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="80%">
        <div className="p-1" style={{ minWidth: 500, maxWidth: 1500, width: '100%' }}>
          <DialogTitle id="form-dialog-title">Registry Information</DialogTitle>
          <DialogContent className="mx-1" style={{ marginTop: -15 }}>
            <Card style={{ maxHeight: '80vh', overflow: 'auto' }}>
              <JSONPretty id="json-pretty" data={registryInfo}></JSONPretty>
            </Card>
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
