import React, { Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Card from '@material-ui/core/Card';
import JSONPretty from 'react-json-pretty';

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
