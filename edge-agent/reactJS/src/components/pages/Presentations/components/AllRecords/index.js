import React, { Fragment, useEffect, useState } from 'react';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import { withSnackbar } from 'notistack';

import ExchangeDetails from './ExchangeDetails';
import SideList from '../../../../sharedComponents/exchanges/SideList';
import StartProofExchangeDialog from './StartProofExchangeDialog';
import { transformPresentationState } from '../../../../../resources/utils';

const S = {
  Root: styled.div`
    flex-grow: 1;
    width: '100%';
    height: '100%';
  `,
  GridCard: styled(Grid)`
    width: 200;
  `,
  GridDetails: styled(Grid)`
    margin: 10px !important; // needed to force component update
    margin-left: 20px !important; // needed to force component update
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
};

const AllRecords = ({
  exchanges,
  recordId,
  addExchange,
  updateExchange,
  removeExchange,
  enqueueSnackbar,
  closeSnackbar,
}) => {
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [isStartExchangeOpen, setIsStartExchangeOpen] = useState(false);

  // Set the selected exchange
  useEffect(() => {
    if (exchanges && exchanges.length && recordId) {
      const selected = exchanges.find((exchange) => {
        return exchange.presentationExchangeId === recordId;
      });
      if (selected) {
        // If there is one exchange with the given id
        setSelectedExchange(selected);
      } else {
        setSelectedExchange(null);
      }
    } else {
      setSelectedExchange(null);
    }
  }, []);

  const showSnackbarVariant = (message, variant) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: (key) => (
        <Fragment>
          <Button
            style={{ color: 'white' }}
            onClick={() => {
              closeSnackbar(key);
            }}
          >
            <strong>Dismiss</strong>
          </Button>
        </Fragment>
      ),
    });
  };

  const changeExchange = (id) => {
    if (!id) {
      setSelectedExchange(null);
    } else {
      const exchange = exchanges.find((exchange) => {
        return exchange.presentationExchangeId === id;
      });
      exchange ? setSelectedExchange(exchange) : setSelectedExchange(null);
    }
  };

  return (
    <S.Root>
      <Grid container>
        <S.GridCard item>
          <SideList
            exchanges={exchanges.map((exchange) => {
              const { presentationExchangeId: id, ...otherProps } = exchange;
              const stateToDisplay = transformPresentationState(exchange.state);
              return { id, stateToDisplay, ...otherProps };
            })}
            selectedExchange={
              selectedExchange
                ? {
                    id: selectedExchange.presentationExchangeId,
                    state: selectedExchange.state,
                  }
                : null
            }
            changeExchange={changeExchange}
          />
          <Grid container style={{ textAlign: 'center' }}>
            <S.GridButton item xs={12}>
              <S.MyButton
                className="mt-2"
                type="button"
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsStartExchangeOpen(true);
                }}
              >
                New Exchange
              </S.MyButton>
            </S.GridButton>
          </Grid>
        </S.GridCard>
        <S.GridDetails item>
          <ExchangeDetails
            exchange={
              selectedExchange && {
                ...selectedExchange,
                stateToDisplay: transformPresentationState(selectedExchange.state),
              }
            }
            updateExchange={updateExchange}
            removeExchange={removeExchange}
            showSnackbarVariant={showSnackbarVariant}
          />
        </S.GridDetails>
      </Grid>
      <StartProofExchangeDialog
        isOpen={isStartExchangeOpen}
        handleClose={() => setIsStartExchangeOpen(false)}
        addExchange={addExchange}
      />
    </S.Root>
  );
};

export default withSnackbar(AllRecords);
