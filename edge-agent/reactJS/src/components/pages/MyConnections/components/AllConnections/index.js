/* eslint-disable */
/* eslint-disable react/no-direct-mutation-state */

import React, { Fragment, useEffect, useState } from 'react';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';

import ExchangeDetails from './ExchangeDetails';
import SideList from '../../../../sharedComponents/exchanges/SideList';
import StartConnectionDialog from './StartConnectionDialog';
import { withSnackbar } from 'notistack';
import { transformConnectionState } from '../../../../../resources/utils';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import {
  addConnection,
  updateConnection,
  removeConnection,
} from '../../../../../redux/actions/connections';
import { getConnections } from '../../../../../redux/selectors';

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

const AllRecords = ({ recordId, enqueueSnackbar, closeSnackbar }) => {
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [isStartConnectionOpen, setIsStartConnectionOpen] = useState(false);
  const connections = useSelector(getConnections);
  const dispatch = useDispatch();

  // Set the selected connection
  useEffect(() => {
    if (connections && connections.length && recordId) {
      const selected = connections.find((connection) => {
        return connection.connectionId === recordId;
      });
      if (selected) {
        // If there is one connection with the given id
        setSelectedConnection(selected);
      } else {
        setSelectedConnection(null);
      }
    } else {
      setSelectedConnection(null);
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

  const changeConnection = (id) => {
    if (!id) {
      setSelectedConnection(null);
    } else {
      const connection = connections.find((connection) => {
        return connection.connectionId === id;
      });
      connection ? setSelectedConnection(connection) : setSelectedConnection(null);
    }
  };

  return (
    <S.Root>
      <S.Title>Connection Exchanges</S.Title>
      <Grid container className="px-4 py-2">
        <S.GridCard item>
          <SideList
            exchanges={(connections || []).map((connection) => {
              const { connectionId: id, ...otherProps } = connection;
              const stateToDisplay = transformConnectionState(
                connection.state,
                connection.initiator
              );
              return { id, stateToDisplay, ...otherProps };
            })}
            selectedExchange={
              selectedConnection
                ? {
                    id: selectedConnection.connectionId,
                    state: selectedConnection.state,
                  }
                : null
            }
            changeExchange={changeConnection}
            isConnection={true}
          />
          <Grid container style={{ textAlign: 'center' }}>
            <S.GridButton item xs={12}>
              <S.MyButton
                className="mt-3"
                type="button"
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsStartConnectionOpen(true);
                }}
              >
                New Connection
              </S.MyButton>
            </S.GridButton>
          </Grid>
        </S.GridCard>
        <S.GridDetails item className="ml-4">
          <ExchangeDetails
            exchange={
              selectedConnection && {
                ...selectedConnection,
                stateToDisplay: transformConnectionState(
                  selectedConnection.state,
                  selectedConnection.initiator
                ),
              }
            }
            updateExchange={(connection) => dispatch(updateConnection(connection))}
            removeExchange={(connection) => dispatch(removeConnection(connection.connectionId))}
            showSnackbarVariant={showSnackbarVariant}
          />
        </S.GridDetails>
      </Grid>
      <StartConnectionDialog
        isOpen={isStartConnectionOpen}
        handleClose={() => setIsStartConnectionOpen(false)}
        addConnection={(connection) => dispatch(addConnection(connection))}
      />
    </S.Root>
  );
};

export default withSnackbar(AllRecords);
