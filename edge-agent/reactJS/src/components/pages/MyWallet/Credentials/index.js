/* eslint-disable */
/* eslint-disable react/no-direct-mutation-state */

import React, { useState, useEffect } from 'react';

// Redux
import { useSelector } from 'react-redux';
import { getToken } from '../../../../redux/selectors';

import axios from 'axios';
import config from '../../../../config';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { withSnackbar } from 'notistack';
import styled from 'styled-components';

import CredentialItem from './components/CredentialItem';

const Root = styled.div`
  flex-grow: 1;
  width: '100%';
  height: '100%';
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 25px;
  font-size: 1.4em;
`;

const MyCredentials = ({ enqueueSnackbar, closeSnackbar }) => {
  const [credentials, setCredentials] = useState([]);

  const accessToken = useSelector(getToken);

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

  useEffect(() => {
    axios
      .get(`${config.endpoint}/api/wallet/credentials`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          setCredentials(res.data.credentials);
        } else {
          const error = new Error(res.error);
          throw error;
        }
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error getting credentials. Please try again.', 'error');
      });
  }, []);

  return (
    <Root>
      <Title>My Credentials</Title>
      <Grid container className="px-4 py-2">
        {credentials.length ? (
          credentials.map((credential) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={credential.referent}>
              <CredentialItem credential={credential} />
            </Grid>
          ))
        ) : (
          <p>You don't have any credentials yet.</p>
        )}
      </Grid>
    </Root>
  );
};

export default withSnackbar(MyCredentials);
