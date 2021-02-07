import React, { useState } from 'react';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import config from '../../../../../../config';

import RecordDetails from '../../../../../sharedComponents/exchanges/RecordDetails';
import RecordActions from './RecordActions';

import ProposePresentation from '../ProposePresentation';
import RequestPresentation from '../RequestPresentation';
import SendPresentation from '../SendPresentation';
import { Dialog, DialogContent } from '@material-ui/core';

const ExchangeDetails = ({
  exchange,
  updateExchange,
  removeExchange,
  changeTabs,
  showSnackbarVariant,
  accessToken,
}) => {
  const [isProposeDialogOpen, setIsProposeDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  const deleteRecord = (id) => {
    const jwt = accessToken;

    axios
      .delete(`${config.endpoint}/api/presentation-exchanges/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then(({ data: { id } }) => {
        console.log(id);
        removeExchange(id);
        showSnackbarVariant('Presentation exchange record deleted.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant(
          'Error deleting presentation exchange record. Please try again.',
          'error'
        );
      });
  };

  return exchange ? (
    <div>
      <Card>
        <RecordDetails
          record={{
            recordId: exchange.presentationExchangeId,
            initiator: exchange.initiator,
            role: exchange.role,
            state: exchange.state,
            stateToDisplay: exchange.stateToDisplay,
            threadId: exchange.threadId,
            connectionId: exchange.connectionId,
            proposal: exchange.presentationProposalDict,
            request: exchange.presentationRequest,
            presentation: exchange.presentation,
            verified: exchange.verified,
            error: exchange.error,
          }}
        />
        <CardActions>
          <RecordActions
            id={exchange.presentationExchangeId}
            state={exchange.state}
            role={exchange.role}
            updateExchange={updateExchange}
            changeTabs={changeTabs}
            openProposePresentationDialog={() => setIsProposeDialogOpen(true)}
            openRequestPresentationDialog={() => setIsRequestDialogOpen(true)}
            openSendPresentationDialog={() => setIsSendDialogOpen(true)}
          />
          <Button
            size="small"
            color="primary"
            onClick={() => deleteRecord(exchange.presentationExchangeId)}
          >
            Remove Record
          </Button>
        </CardActions>
      </Card>
      {/* <SendPresentationDialog
        isOpen={isSendPresentationOpen}
        handleClose={() => setIsSendPresentationOpen(false)}
        updateExchange={updateExchange}
        record={exchange}
      /> */}
      <Dialog open={isProposeDialogOpen} onClose={() => setIsProposeDialogOpen(false)}>
        <DialogContent className="p-0">
          <ProposePresentation
            connectionId={exchange.connectionId}
            closeDialog={() => setIsProposeDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isRequestDialogOpen} onClose={() => setIsRequestDialogOpen(false)}>
        <DialogContent className="p-0">
          <RequestPresentation
            connectionId={exchange.connectionId}
            recordId={exchange.presentationExchangeId}
            presentationProposalDict={exchange.presentationProposalDict}
            closeDialog={() => setIsRequestDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isSendDialogOpen} onClose={() => setIsSendDialogOpen(false)}>
        <DialogContent className="p-0">
          <SendPresentation record={exchange} closeDialog={() => setIsSendDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  ) : (
    <div align="center">
      <Typography gutterBottom variant="body1" component="h2">
        Select one record to see the details.
      </Typography>
    </div>
  );
};

export default ExchangeDetails;
