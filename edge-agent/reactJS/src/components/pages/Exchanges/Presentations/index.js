import React, { useState, useEffect, Fragment } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';

import axios from 'axios';
import config from '../../../../config';

import AllRecords from './components/AllRecords/index';
import qs from 'qs';
import { withSnackbar } from 'notistack';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import {
  setPresExchanges,
  addPresExchange,
  updatePresExchange,
} from '../../../../redux/actions/presExchanges';
import { getPresExchanges, getToken } from '../../../../redux/selectors';

import io from 'socket.io-client';
let socket;

function PresentationNotifications() {
  const dispatch = useDispatch();
  useEffect(() => {
    socket = io(config.agentEndpoint);
    return () => {
      socket.emit('disconnect');
      socket.off();
    };
  }, [config.agentEndpoint]);

  useEffect(() => {
    socket.on('notification', (notification) => {
      if (notification.protocol === 'presentation') {
        // If it is a presentation exchange notification, update record
        dispatch(updatePresExchange(notification.record));
      }
    });
  }, []);

  return null;
}

const Presentations = ({ enqueueSnackbar, closeSnackbar, classes }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  const [isLoading, setIsLoading] = useState(false);
  const exchanges = useSelector(getPresExchanges);
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
      .get(`${config.endpoint}/api/presentation-exchanges`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data: { records } }) => {
        if (records) dispatch(setPresExchanges(records));
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant(
          'Error getting presentation exchanges records. Please refresh the page.',
          'error'
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const getExchange = (recordId) => {
    return exchanges.find((exchange) => exchange.presentationExchangeId === recordId);
  };

  const search = qs.parse(location.search, { ignoreQueryPrefix: true });
  const recordId = search.recordId || null;

  return (
    <>
      <PresentationNotifications
        updateExchange={(record) => dispatch(updatePresExchange(record))}
      />
      <AllRecords recordId={recordId} isLoading={isLoading} />
    </>
  );
};

export default withSnackbar(Presentations);
