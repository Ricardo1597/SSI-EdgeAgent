import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class PublishAllDialog extends Component {
  render() {
    return (
      <div>
        <Dialog
          open={this.props.open}
          onClose={this.props.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <div className="p-1">
            <DialogTitle id="form-dialog-title">Publish Pending Revocations</DialogTitle>
            <DialogContentText
              className="mx-2"
              style={{ paddingLeft: 24, paddingRight: 20, textAlign: 'justify' }}
            >
              Are you sure you want to publish all pending revocations from all registries to the
              ledger?
            </DialogContentText>
            <DialogActions>
              <Button
                onClick={() => {
                  this.props.handleClose();
                }}
                color="primary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  this.props.handleClose();
                  this.props.onPublishAll();
                }}
                color="primary"
              >
                Publish
              </Button>
            </DialogActions>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default PublishAllDialog;
