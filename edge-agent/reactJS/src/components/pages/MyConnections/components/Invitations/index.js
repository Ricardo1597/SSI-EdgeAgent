/* eslint-disable */
/* eslint-disable react/no-direct-mutation-state */

import React, { useState, useEffect } from 'react';

import axios from 'axios';
import config from '../../../../../config';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { withSnackbar } from 'notistack';

import InvitationActions from './components/InvitationActions.js';
import ExchangeDetails from './components/ExchangeDetails';
import CreateInvitation from '../CreateInvitation';
import styled from 'styled-components';
import ListOfExchanges from '../../../../sharedComponents/exchanges/ListOfExchanges';
import { Dialog, DialogContent } from '@material-ui/core';

// Redux
import { useSelector } from 'react-redux';
import { getToken } from '../../../../../redux/selectors';

const S = {
  Root: styled.div`
    flex-grow: 1;
    width: '100%';
    height: '100%';
  `,
  SideListDiv: styled.div`
    background-color: white;
    border-radius: 5px;
    width: 400px;
  `,
  GridCard: styled(Grid)`
    width: 200;
  `,
  GridDetails: styled(Grid)`
    border-radius: 10;
    flex-grow: 1;
    background-color: '#F6F6F6';
    min-width: 500;
  `,
  GridButton: styled(Grid)`
    width: 200px;
  `,
  MyButton: styled(Button)`
    width: 275px;
  `,
  Title: styled.div`
    display: flex;
    align-items: center;
    height: 50px;
    padding-left: 25px;
    font-size: 1.4em;
  `,
};

const Invitations = ({ enqueueSnackbar, closeSnackbar, classes }) => {
  const [invitations, setInvitations] = useState([]);
  const [selectedInvitation, setSelectedInvitation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInvitationDialogOpen, setIsInvitationDialogOpen] = useState(false);

  const accessToken = useSelector(getToken);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${config.endpoint}/api/connections/invitations`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data: { invitations } }) => {
        console.log(invitations);
        setInvitations(invitations);
        if (invitations.length) setSelectedInvitation(invitations[0]);
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error getting invitations. Please try again.', 'error');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken, showSnackbarVariant]);

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

  const changeInvitation = (id) => {
    if (!id) {
      setSelectedInvitation(null);
    } else {
      const invitation = invitations.find((invitation) => {
        return invitation.invitationId === id;
      });
      invitation ? setSelectedInvitation(invitation) : setSelectedInvitation(null);
    }
  };

  const setIsInvitationActive = (invitationId, isActive) => {
    console.log('Update active: ', invitationId, isActive);
    let updatedInvitations = invitations.map((invitation) => {
      if (invitation.invitationId === invitationId) {
        const updatedInvitation = { ...invitation, isActive: isActive };
        setSelectedInvitation(updatedInvitation);
        return updatedInvitation;
      }
      return invitation;
    });
    setInvitations(updatedInvitations);
  };

  const addInvitation = (invitation) => {
    setInvitations(
      [...invitations, invitation].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    );
  };

  console.log('Selected Invitation: ', selectedInvitation);

  return (
    <S.Root>
      <S.Title>Invitations</S.Title>
      <Grid container className="px-4 py-2">
        <S.GridCard item>
          <S.SideListDiv className="p-1">
            <div className="py-3 pr-3">
              <ListOfExchanges
                exchanges={(invitations || []).map((invitation) => {
                  const { invitationId: id, ...otherProps } = invitation;
                  return { id, ...otherProps };
                })}
                selectedExchangeId={selectedInvitation && selectedInvitation.invitationId}
                changeExchange={changeInvitation}
                isLoading={isLoading}
              />
            </div>
          </S.SideListDiv>
          <Grid container style={{ textAlign: 'center' }}>
            <S.GridButton item xs={12}>
              <S.MyButton
                className="mt-3"
                type="button"
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsInvitationDialogOpen(true);
                }}
              >
                Create Invitation
              </S.MyButton>
            </S.GridButton>
          </Grid>
        </S.GridCard>
        <S.GridDetails item className="ml-4">
          {selectedInvitation !== '' ? (
            <Card>
              <ExchangeDetails invitation={selectedInvitation} />
              <CardActions>
                <InvitationActions
                  invitation={selectedInvitation}
                  setIsInvitationActive={setIsInvitationActive}
                />
              </CardActions>
            </Card>
          ) : null}
        </S.GridDetails>
      </Grid>
      <Dialog open={isInvitationDialogOpen} onClose={() => setIsInvitationDialogOpen(false)}>
        <DialogContent className="p-0">
          <CreateInvitation
            addInvitation={(invitation) => {
              addInvitation(invitation);
              setSelectedInvitation(invitation);
            }}
          />
        </DialogContent>
      </Dialog>
    </S.Root>
  );
};

// Styles
const useStyles = (theme) => ({
  details: {
    marginLeft: 30,
    padding: 20,
    borderRadius: 10,
    flexGrow: 1,
    backgroundColor: '#F6F6F6',
  },
});

export default withStyles(useStyles)(withSnackbar(Invitations));
