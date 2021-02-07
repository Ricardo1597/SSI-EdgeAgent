import React, { useState, useEffect, Fragment } from 'react';
import { useLocation } from 'react-router-dom';

import Button from '@material-ui/core/Button';

import AllRecords from './components/AllRecords/index';
import qs from 'qs';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../config';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { setCredExchanges, updateCredExchange } from '../../../../redux/actions/credExchanges';
import { getCredExchanges, getToken } from '../../../../redux/selectors';

import io from 'socket.io-client';
let socket;

function CredentialNotifications() {
  const dispatch = useDispatch();
  useEffect(() => {
    socket = io(config.agentEndpoint);
    return () => {
      socket.emit('disconnect');
      socket.off();
    };
  }, []);

  useEffect(() => {
    socket.on('notification', (notification) => {
      if (notification.protocol === 'credential') {
        // If it is a credential exchange notification, update record
        dispatch(updateCredExchange(notification.record));
      }
    });
  }, []);

  return null;
}

const Credentials = ({ enqueueSnackbar, closeSnackbar }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const exchanges = useSelector(getCredExchanges);
  const accessToken = useSelector(getToken);

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

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${config.endpoint}/api/credential-exchanges`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data: { records } }) => {
        console.log('Credentials: ', records);
        if (records) dispatch(setCredExchanges(records));
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant(
          'Error getting credentials exchanges records. Please try again.',
          'error'
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const search = qs.parse(location.search, { ignoreQueryPrefix: true });
  const recordId = search.recordId;

  console.log('Exchanges: ', exchanges);

  return (
    <>
      <CredentialNotifications />
      <AllRecords recordId={recordId} isLoading={isLoading} />
    </>
  );
};

export default withSnackbar(Credentials);
