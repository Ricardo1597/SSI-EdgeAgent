import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Dialog } from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import styled from 'styled-components';

const MyButton = styled(Button)`
  width: 175px;
  margin: 10px;
`;

const StartProofExchangeDialog = ({ isOpen, handleClose, addExchange }) => {
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
          {/*<ProposeCredential addExchange={addExchange} />*/}
          <p>Dialog 1</p>
        </DialogContent>
      ) : selectedOperation == 1 ? (
        <DialogContent className="p-0">
          {/*<OfferCredential addExchange={addExchange} />*/}
          <p>Dialog 2</p>
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
                    setSelectedOperation(0);
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
                    setSelectedOperation(1);
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
