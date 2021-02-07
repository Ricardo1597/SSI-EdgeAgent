import React, { Fragment, useEffect, useState } from 'react';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import { withSnackbar } from 'notistack';

import ExchangeDetails from './ExchangeDetails';
import SideList from '../../../../../sharedComponents/exchanges/SideList';
import StartProofExchangeDialog from './StartProofExchangeDialog';
import { transformPresentationState } from '../../../../../../resources/utils';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import {
  updatePresExchange,
  removePresExchange,
} from '../../../../../../redux/actions/presExchanges';
import { getPresExchanges } from '../../../../../../redux/selectors';

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
    border-radius: 10;
    flex-grow: 1;
    background-color: '#F6F6F6';
    min-width: 400px !important;
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

const AllRecords = ({ recordId, changeTabs, enqueueSnackbar, closeSnackbar, isLoading }) => {
  const dispatch = useDispatch();

  const exchanges = useSelector(getPresExchanges);

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
      if (selectedExchange) {
        const updatedSelected = exchanges.find((exchange) => {
          return exchange.presentationExchangeId === selectedExchange.presentationExchangeId;
        });

        if (selectedExchange !== updatedSelected) setSelectedExchange(updatedSelected);
      }
    }
  }, [exchanges]);

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
      <S.Title>Presentation Exchanges</S.Title>
      <Grid container className="px-4 py-2">
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
            isLoading={isLoading}
          />
          <Grid container style={{ textAlign: 'center' }}>
            <S.GridButton item xs={12}>
              <S.MyButton
                className="mt-3"
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
        <S.GridDetails item className="ml-4">
          <ExchangeDetails
            exchange={
              selectedExchange && {
                ...selectedExchange,
                stateToDisplay: transformPresentationState(selectedExchange.state),
              }
            }
            changeTabs={changeTabs}
            updateExchange={(record) => {
              dispatch(updatePresExchange(record));
            }}
            removeExchange={(record) => {
              dispatch(removePresExchange(record));
              setSelectedExchange(null);
            }}
            showSnackbarVariant={showSnackbarVariant}
          />
        </S.GridDetails>
      </Grid>
      <StartProofExchangeDialog
        isOpen={isStartExchangeOpen}
        handleClose={() => setIsStartExchangeOpen(false)}
      />
    </S.Root>
  );
};

export default withSnackbar(AllRecords);
