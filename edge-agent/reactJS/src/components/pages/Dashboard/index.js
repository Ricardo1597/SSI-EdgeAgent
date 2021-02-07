import React, { useState, useEffect } from 'react';

import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import CustomPaginationTable from './DidTable/DidTable';
import CreateDidDialog from './CreateDidDialog';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import SearchIcon from '@material-ui/icons/Search';

import axios from 'axios';
import config from '../../../config';

// Styled Components
const S = {
  TableDiv: styled.div`
    padding: 30px;
    width: 100%;
    position: relative;
  `,
  NewDidButton: styled(Button)`
    width: 150px;
    height: 35px;
    background-color: #5577ee !important;
    color: white !important;
  `,
  FilterDiv: styled.div`
    flex-grow: 1;
    display: flex;
    margin-bottom: 15px;
    margin-top: 25px;
  `,
  TopButtonsDiv: styled.div`
    width: 250px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    margin-right: 20px;
    margin-bottom: 15px;
    margin-top: 25px;
  `,
  MySearchIcon: styled(SearchIcon)`
    transform: translateY(4px);
    margin-right: 10px;
  `,
};
const Dashboard = ({ enqueueSnackbar, closeSnackbar, accessToken }) => {
  const [dids, setDids] = useState([]);
  const [filteredDids, setFilteredDids] = useState([]);
  const [filter, setFilter] = useState('');
  // const [width, setWidth] = useState(window.innerWidth);
  const [isCreateDidDialogOpen, setIsCreateDidDialogOpen] = useState(false);

  // const updateDimensions = () => {
  //   setWidth(window.innerWidth);
  // };

  // useEffect(() => {
  //   // subscribe event
  //   window.addEventListener('resize', updateDimensions);
  //   return () => {
  //     // unsubscribe event
  //     window.removeEventListener('resize', updateDimensions);
  //   };
  // }, []);

  useEffect(() => {
    setDids(JSON.parse(localStorage.getItem('dids')));
  }, []);

  useEffect(() => {
    setFilteredDids(
      (dids || []).filter((did) => did.metadata.alias.toLowerCase().includes(filter))
    );
  }, [filter, dids]);

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
      style={{ minHeight: 'calc(100vh - 55px)', width: '100%' }}
    >
      <S.TableDiv>
        <div style={{ maxWidth: 1500, margin: '0 auto' }}>
          <Typography component="span" variant="h5">
            <strong>My Decentralized Identifiers</strong>
          </Typography>
          <div style={{ display: 'flex', width: '100%' }}>
            <S.FilterDiv>
              <S.MySearchIcon />
              <TextField
                fullWidth
                id="filter"
                name="filter"
                placeholder="Search by alias"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </S.FilterDiv>
            <S.TopButtonsDiv>
              <Tooltip title="Register a new DID">
                <S.NewDidButton
                  type="button"
                  variant="contained"
                  onClick={() => {
                    setIsCreateDidDialogOpen(true);
                  }}
                >
                  <AddCircleOutlineIcon fontSize="small" style={{ marginRight: 5 }} /> New DID
                </S.NewDidButton>
              </Tooltip>
            </S.TopButtonsDiv>
          </div>
          <CustomPaginationTable
            dids={filteredDids.sort((a, b) =>
              a.metadata.alias > b.metadata.alias ? 1 : b.metadata.alias > a.metadata.alias ? -1 : 0
            )}
            getRole={getRole}
          />
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
