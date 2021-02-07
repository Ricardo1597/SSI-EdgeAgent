import React, { Fragment, useEffect, useState } from 'react';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import { withSnackbar } from 'notistack';

import ExchangeDetails from './ExchangeDetails';
import SideList from '../../../../../sharedComponents/exchanges/SideList';
import StartCredExchangeDialog from './StartCredExchangeDialog';
import { transformCredentialState } from '../../../../../../resources/utils';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { addCredExchange, removeCredExchange } from '../../../../../../redux/actions/credExchanges';
import { getCredExchanges } from '../../../../../../redux/selectors';

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

const AllRecords = ({ recordId, enqueueSnackbar, closeSnackbar, isLoading }) => {
  const dispatch = useDispatch();

  const exchanges = useSelector(getCredExchanges);

  const [selectedExchange, setSelectedExchange] = useState(null);
  const [isStartExchangeOpen, setIsStartExchangeOpen] = useState(false);

  // Set the selected exchange
  useEffect(() => {
    if (exchanges && exchanges.length && recordId) {
      const selected = exchanges.find((exchange) => {
        return exchange.credentialExchangeId === recordId;
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
          return exchange.credentialExchangeId === selectedExchange.credentialExchangeId;
        });

        if (selectedExchange !== updatedSelected) setSelectedExchange(updatedSelected);
      }
    }
  }, [exchanges, recordId, selectedExchange]);

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
        return exchange.credentialExchangeId === id;
      });
      exchange ? setSelectedExchange(exchange) : setSelectedExchange(null);
    }
  };

  return (
    <S.Root>
      <S.Title>Credential Exchanges</S.Title>
      <Grid container className="px-4 py-2">
        <S.GridCard item>
          <SideList
            exchanges={exchanges.map((exchange) => {
              const { credentialExchangeId: id, ...otherProps } = exchange;
              const stateToDisplay = transformCredentialState(exchange.state);
              return { id, stateToDisplay, ...otherProps };
            })}
            selectedExchange={
              selectedExchange
                ? {
                    id: selectedExchange.credentialExchangeId,
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
                stateToDisplay: transformCredentialState(selectedExchange.state),
              }
            }
            updateExchange={(record) => {
              setSelectedExchange(record);
            }}
            removeExchange={(record) => {
              dispatch(removeCredExchange(record));
              setSelectedExchange(null);
            }}
            showSnackbarVariant={showSnackbarVariant}
          />
        </S.GridDetails>
      </Grid>
      <StartCredExchangeDialog
        isOpen={isStartExchangeOpen}
        handleClose={() => setIsStartExchangeOpen(false)}
        addExchange={(record) => {
          dispatch(addCredExchange(record));
          setSelectedExchange(record);
        }}
      />
    </S.Root>
  );
};

export default withSnackbar(AllRecords);
