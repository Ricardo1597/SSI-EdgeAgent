import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Tooltip from '@material-ui/core/Tooltip';
import styled from 'styled-components';

import ProposeCredential from '../ProposeCredential';
import OfferCredential from '../OfferCredential';

const MyButtonDiv = styled.div`
  margin: 10px;
`;

const MyButton = styled(Button)`
  width: 205px;
`;

const StartCredExchangeDialog = ({ isOpen, handleClose, addExchange }) => {
  const [selectedOperation, setSelectedOperation] = useState(null);

  const handleCloseDialog = async () => {
    handleClose();
    // Needed to stop the base dialog from showing on close
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSelectedOperation(null);
  };

  const getDIDPermissions = () => {
    const dids = JSON.parse(localStorage.getItem('dids'));
    return dids &&
      dids.filter((did) => did.role !== null && did.role !== 'no role' && did.role !== '201')
        .length > 0
      ? true
      : false;
  };

  return (
    <Dialog open={isOpen} onClose={handleCloseDialog}>
      {selectedOperation == 0 ? (
        <DialogContent className="p-0">
          <ProposeCredential addExchange={addExchange} handleClose={handleCloseDialog} />
        </DialogContent>
      ) : selectedOperation == 1 ? (
        <DialogContent className="p-0">
          <OfferCredential addExchange={addExchange} handleClose={handleCloseDialog} />
        </DialogContent>
      ) : (
        <div className="p-2" style={{ textAlign: 'center' }}>
          <DialogTitle id="form-dialog-title">
            How would you like to start a new credential exchange?
          </DialogTitle>
          <DialogContent className="mx-2 mb-3" style={{ height: 140 }}>
            <p style={{ textAlign: 'justify' }}>
              Select <strong>Propose</strong> if you want to ask an issuer to issue you a
              credential. Select <strong>Offer</strong> if you want to issue a credential to
              someone.
            </p>
            <Grid container justify="space-between" spacing={3}>
              <Grid item xs={6}>
                <MyButtonDiv>
                  <MyButton
                    onClick={() => {
                      setSelectedOperation(0);
                    }}
                    variant="contained"
                    color="primary"
                  >
                    Propose
                  </MyButton>
                </MyButtonDiv>
              </Grid>
              <Grid item xs={6}>
                {getDIDPermissions() ? (
                  <MyButtonDiv>
                    <MyButton
                      onClick={() => {
                        setSelectedOperation(1);
                      }}
                      variant="contained"
                      color="primary"
                    >
                      Offer
                    </MyButton>
                  </MyButtonDiv>
                ) : (
                  <Tooltip title="You can't issue credentials.">
                    <MyButtonDiv>
                      <MyButton
                        disabled={true}
                        onClick={() => {
                          setSelectedOperation(1);
                        }}
                        variant="contained"
                        color="primary"
                      >
                        Offer
                      </MyButton>
                    </MyButtonDiv>
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          </DialogContent>
        </div>
      )}
    </Dialog>
  );
};

export default StartCredExchangeDialog;
