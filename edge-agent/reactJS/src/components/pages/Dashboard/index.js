import React, { Component, Fragment, useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import CustomPaginationTable from './DidTable/DidTable';
import CreateDidDialog from './CreateDidDialog';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

import axios from 'axios';
import config from '../../../config';

// Styled Components
const S = {
  TableDiv: styled.div`
    padding: 30px;
    width: 100%;
    position: relative;
  `,
};
const Dashboard = ({ enqueueSnackbar, closeSnackbar, accessToken }) => {
  const [dids, setDids] = useState(JSON.parse(localStorage.getItem('dids')));
  const [width, setWidth] = useState(window.innerWidth);
  const [isCreateDidDialogOpen, setIsCreateDidDialogOpen] = useState(false);

  const updateDimensions = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    // subscribe event
    window.addEventListener('resize', updateDimensions);
    return () => {
      // unsubscribe event
      window.removeEventListener('resize', updateDimensions);
    };
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

  const onCreateDid = (seed, alias) => {
    const jwt = accessToken;

    axios.defaults.withCredentials = true;
    axios
      .post(
        `${config.endpoint}/api/wallet/create-did`,
        {
          seed: seed,
          alias: alias,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        let dids = JSON.parse(localStorage.getItem('dids'));
        dids = [res.data.did, ...dids];
        localStorage.setItem('dids', JSON.stringify(dids));
        setDids(dids);
        showSnackbarVariant('New DID added to your wallet.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error creating DID. Please try again.', 'error');
      });
  };

  const getRole = (role) => {
    switch (role) {
      case '0':
        return 'Trustee user';
      case '2':
        return 'Steward user';
      case '101':
        return 'Trust anchor user';
      case '201':
        return 'Network monitor user';
      default:
        return 'Not in use';
    }
  };

  return (
    <div
      className={`p-4 root-background`}
      style={{ minHeight: 'calc(100vh - 50px)', width: '100%' }}
    >
      <div>
        <h2>Welcome to SSI! :)</h2>
        <p>This is a self-sovereign identity app where you control your own identity!</p>
      </div>

      <S.TableDiv>
        <div style={{ maxWidth: 1500, margin: '0 auto' }}>
          <div style={{ display: 'flex', width: '100%' }}>
            <div style={{ width: 350, marginBottom: 15 }}>
              <Typography component="span" variant="h5">
                <strong>My Decentralized Identifiers</strong>
              </Typography>
            </div>
            <div
              style={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', marginRight: 10 }}
            >
              <Tooltip title="Register a new DID">
                <Button
                  type="button"
                  variant="contained"
                  style={{
                    width: 150,
                    marginRight: 10,
                    height: 35,
                    backgroundColor: '#24a0ed',
                    color: 'white',
                  }}
                  onClick={() => {
                    setIsCreateDidDialogOpen(true);
                  }}
                >
                  <AddCircleOutlineIcon fontSize="small" style={{ marginRight: 5 }} /> New DID
                </Button>
              </Tooltip>
            </div>
          </div>
          <CustomPaginationTable dids={dids} getRole={getRole} />
        </div>
      </S.TableDiv>
      <CreateDidDialog
        isOpen={isCreateDidDialogOpen}
        handleClose={() => setIsCreateDidDialogOpen(false)}
        onCreateDid={onCreateDid}
      />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withSnackbar(Dashboard));
