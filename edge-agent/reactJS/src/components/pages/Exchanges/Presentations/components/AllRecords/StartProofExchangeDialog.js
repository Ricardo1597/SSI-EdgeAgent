import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Dialog } from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import styled from 'styled-components';

import ProposePresentation from '../ProposePresentation';
import RequestPresentation from '../RequestPresentation';

const MyButton = styled(Button)`
  width: 175px;
  margin: 10px;
`;

const StartProofExchangeDialog = ({ isOpen, handleClose }) => {
  const [selectedOperation, setSelectedOperation] = useState(0);

  const handleCloseDialog = async () => {
    handleClose();
    // Needed to stop the base dialog from showing on close
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSelectedOperation(0);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleCloseDialog}
      fullWidth={true}
      maxWidth={selectedOperation === 2 ? 'sm' : 'sm'}
    >
      {selectedOperation === 1 ? (
        <DialogContent className="p-0">
          <ProposePresentation closeDialog={handleCloseDialog} />
        </DialogContent>
      ) : selectedOperation === 2 ? (
        <DialogContent className="p-0">
          <RequestPresentation closeDialog={handleCloseDialog} />
        </DialogContent>
      ) : (
        <div className="p-2" style={{ textAlign: 'center' }}>
          <DialogTitle id="form-dialog-title">
            How would you like to start a new presentation exchange?
          </DialogTitle>
          <DialogContent className="mx-2 mb-3" style={{ height: 140 }}>
            <p style={{ textAlign: 'justify' }}>
              Select <strong>Propose</strong> if you want to present a proof of attributes to a
              verifier. Select <strong>Request</strong> if you want to request a proof from someone.
            </p>
            <Grid container justify="space-between">
              <Grid item xs={6}>
                <MyButton
                  onClick={() => {
                    setSelectedOperation(1);
                  }}
                  variant="contained"
                  color="primary"
                >
                  Propose
                </MyButton>
              </Grid>
              <Grid item xs={6}>
                <MyButton
                  onClick={() => {
                    setSelectedOperation(2);
                  }}
                  variant="contained"
                  color="primary"
                >
                  Request
                </MyButton>
              </Grid>
            </Grid>
          </DialogContent>
        </div>
      )}
    </Dialog>
  );
};

export default StartProofExchangeDialog;
