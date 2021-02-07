import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Dialog } from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import styled from 'styled-components';

import CreateInvitation from '../CreateInvitation';
import ReceiveInvitation from '../ReceiveInvitation';

const MyButton = styled(Button)`
  width: 205px;
  margin: 10px;
`;

const StartConnectionDialog = ({ isOpen, handleClose, addConnection }) => {
  const [selectedOperation, setSelectedOperation] = useState(null);

  const handleCloseDialog = async () => {
    handleClose();
    // Needed to stop the base dialog from showing on close
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSelectedOperation(null);
  };

  return (
    <Dialog open={isOpen} onClose={handleCloseDialog}>
      {selectedOperation == 0 ? (
        <DialogContent className="p-0">
          <CreateInvitation />
        </DialogContent>
      ) : selectedOperation == 1 ? (
        <DialogContent className="p-0">
          <ReceiveInvitation addConnection={addConnection} />
        </DialogContent>
      ) : (
        <div className="p-2" style={{ textAlign: 'center' }}>
          <DialogTitle id="form-dialog-title">
            How would you like to start a new connection?
          </DialogTitle>
          <DialogContent className="mx-2 mb-3" style={{ height: 140 }}>
            <p style={{ textAlign: 'justify' }}>
              Select <strong>New Invitation</strong> to create a new invitation. Select{' '}
              <strong>Use Invitation</strong> to start a connection from an invitation.
            </p>
            <Grid container justify="space-between" spacing={3}>
              <Grid item xs={6}>
                <MyButton
                  onClick={() => {
                    setSelectedOperation(0);
                  }}
                  variant="contained"
                  color="primary"
                >
                  New Invitation
                </MyButton>
              </Grid>
              <Grid item xs={6}>
                <MyButton
                  onClick={() => {
                    setSelectedOperation(1);
                  }}
                  variant="contained"
                  color="primary"
                >
                  Use Invitation
                </MyButton>
              </Grid>
            </Grid>
          </DialogContent>
        </div>
      )}
    </Dialog>
  );
};

export default StartConnectionDialog;
