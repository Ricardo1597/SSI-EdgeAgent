/* eslint-disable */

import React, { useState, useEffect } from 'react';

import Button from '@material-ui/core/Button';

import MyRegistries from './components/MyRegistries';
import { withSnackbar } from 'notistack';
import { useSelector } from 'react-redux';

import axios from 'axios';
import config from '../../../../config';

import { getToken } from '../../../../redux/selectors';

const MyRevocations = ({ enqueueSnackbar, closeSnackbar }) => {
  const [registries, setRegistries] = useState([]);

  const accessToken = useSelector(getToken);

  useEffect(() => {
    axios
      .get(`${config.endpoint}/api/revocation/registries/created`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data: { records } }) => {
        console.log(records);
        if (records) setRegistries(records);
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant(
          'Error getting revocation registries. Please refresh the page.',
          'error'
        );
      });
  }, [accessToken]);

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

  const addRecord = (record) => {
    setRegistries([...registries, record]);
  };

  const updatePending = (id, credRevId) => {
    let myRegistries = registries;
    for (let i = 0; i < myRegistries.length; i++) {
      if (myRegistries[i].revocRegId === id) {
        myRegistries[i].hasPendingRevocations = true;
        myRegistries[i].pendingPub = [...myRegistries[i].pendingPub, credRevId];
        break;
      }
    }
    setRegistries(myRegistries);
  };

  const cleanPending = (id) => {
    let myRegistries = registries;
    if (!id) {
      myRegistries.map((registry) => {
        return { ...registry, hasPendingRevocations: false, pendingPub: [] };
      });
    } else {
      for (let i = 0; i < myRegistries.length; i++) {
        if (myRegistries[i].revocRegId === id) {
          myRegistries[i].hasPendingRevocations = false;
          myRegistries[i].pendingPub = [];
          break;
        }
      }
    }
    setRegistries(myRegistries);
  };

  return (
    <MyRegistries
      myRegistries={registries}
      addRecord={addRecord}
      updatePending={updatePending}
      cleanPending={cleanPending}
    />
  );
};

export default withSnackbar(MyRevocations);
