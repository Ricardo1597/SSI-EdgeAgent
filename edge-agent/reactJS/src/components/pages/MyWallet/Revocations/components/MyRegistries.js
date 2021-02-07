import React, { useState, Fragment, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import PublishIcon from '@material-ui/icons/Publish';
import styled from 'styled-components';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';

import RegistriesTable from './RegistriesTable';
import PublishAllDialog from './PublishAllDialog';
import CreateRegistryDialog from './CreateRegistryDialog';
import RevokeCredentialDialog from './RevokeCredentialDialog';

import axios from 'axios';
import config from '../../../../../config';

const RegistriesPage = styled.div`
  width: 100%;
`;

const RegistriesTableDiv = styled.div`
  padding-top: 20px;
  max-width: 1500px;
  margin: auto;
`;

const NewRegButton = styled(Button)`
  width: 170px;
  margin-right: 10px !important;
  height: 35px;
  background-color: #24a0ed !important;
  color: white !important;
`;

const PubAllButton = styled(Button)`
  width: 151px;
  height: 35px;
  background-color: #8884ff !important;
  color: white !important;
`;

const FilterDiv = styled.div`
  flex-grow: 1;
  display: flex;
  margin-bottom: 15px;
`;

const TopButtonsDiv = styled.div`
  width: 450px;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-right: 20px;
  margin-bottom: 15px;
`;

const MySearchIcon = styled(SearchIcon)`
  transform: translateY(4px);
  margin-right: 10px;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  padding-left: 25px;
  font-size: 1.4em;
`;

const columns = [
  { id: 'name', label: 'Name', width: '29%' },
  { id: 'issuanceType', label: 'Issuance', width: '23%' },
  { id: 'occupation', label: 'Occupation', width: '15%' },
  { id: 'state', label: 'State', width: '15%' },
  { id: 'pendingRevocations', label: 'Pending', width: '15%' },
];

const MyRegistries = ({
  myRegistries,
  addRecord,
  updatePending,
  cleanPending,
  accessToken,
  enqueueSnackbar,
  closeSnackbar,
}) => {
  const [isCreateRegDialogOpen, setIsCreateRegDialogOpen] = useState(false);
  const [isRevokeCredDialogOpen, setIsRevokeCredDialogOpen] = useState(false);
  const [isPublishAllDialogOpen, setIsPublishAllDialogOpen] = useState(false);
  const [selectedRevocReg, setSelectedRevocReg] = useState(false);
  const [filter, setFilter] = useState('');
  const [filteredRegistries, setFilteredRegistries] = useState([]);

  useEffect(() => {
    setFilteredRegistries(
      (myRegistries || []).filter((reg) => (reg.name || '').toLowerCase().includes(filter))
    );
  }, [filter, myRegistries]);

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

  const onCreateReg = ({ credDefId, name, issuanceByDefault, maxCredNum }) => {
    axios
      .post(
        `${config.endpoint}/api/revocation/create-registry`,
        {
          credDefId,
          name,
          issuanceByDefault,
          maxCredNum,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then(({ data: { record } }) => {
        console.log(record);
        addRecord(record);
        showSnackbarVariant('Registry created.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error creating registry. Please try again.', 'error');
      });
  };

  const onRevokeCred = (revocRegId, credRevId, publish) => {
    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/revoke`,
        {
          revocRegId,
          publish,
          credRevId,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then(({ data: { invalidCredRevIds } }) => {
        console.log('invalidCredRevIds: ', invalidCredRevIds);
        if (!publish) {
          updatePending(revocRegId, credRevId);
          showSnackbarVariant('Credential added to pending list.', 'success');
        } else if (invalidCredRevIds.length) {
          showSnackbarVariant(
            'Error revoking credential: invalid credential revocation ID.',
            'error'
          );
        } else {
          showSnackbarVariant('Credential revoked.', 'success');
        }
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error revoking credential. Please try again.', 'error');
      });
  };

  const onPublishPending = (revocRegId) => {
    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/${
          revocRegId ? revocRegId + '/' : ''
        }publish-revocations`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then(({ data: { invalidCredRevIds } }) => {
        console.log(invalidCredRevIds);
        showSnackbarVariant('Credentials revoked.', 'success');
        cleanPending(revocRegId);
        if (Object.keys(invalidCredRevIds).length) {
          showSnackbarVariant(
            'Some credentials were invalid:' + JSON.stringify(invalidCredRevIds),
            'warning'
          );
        }
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error revoking credentials. Please try again.', 'error');
      });
  };

  return (
    <RegistriesPage>
      <Title>My Revocation Registries</Title>
      <RegistriesTableDiv className="p-5">
        <div style={{ display: 'flex', width: '100%' }}>
          <FilterDiv>
            <MySearchIcon />
            <TextField
              fullWidth
              id="filter"
              name="filter"
              placeholder="Search by name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </FilterDiv>
          <TopButtonsDiv>
            <NewRegButton
              type="button"
              variant="contained"
              onClick={() => setIsCreateRegDialogOpen(true)}
            >
              <AddCircleOutlineIcon fontSize="small" style={{ marginRight: 5 }} /> New Registry
            </NewRegButton>
            <Tooltip title="Publish all pending revocations">
              <PubAllButton
                type="button"
                variant="contained"
                color="primary"
                onClick={() => setIsPublishAllDialogOpen(true)}
              >
                <PublishIcon fontSize="small" style={{ marginRight: 5 }} /> Publish All
              </PubAllButton>
            </Tooltip>
          </TopButtonsDiv>
        </div>
        <RegistriesTable
          columns={columns}
          rows={filteredRegistries
            .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : b.updatedAt > a.updatedAt ? 1 : 0))
            .map((registry) => {
              return {
                id: registry.recordId,
                name: registry.name,
                issuanceType:
                  registry.issuanceType === 'ISSUANCE_BY_DEFAULT' ? 'By Default' : 'On Demand',
                occupation: registry.currCredNum + ' / ' + registry.maxCredNum,
                state: registry.state,
                pendingRevocations: registry.pendingPub.length,
                did: registry.issuerDid,
                registry: registry,
              };
            })}
          rowHeight={45}
          onRevokeCredential={(revocRegId) => {
            setSelectedRevocReg(revocRegId);
            setIsRevokeCredDialogOpen(true);
          }}
          onPublishPending={(revocRegId) => {
            onPublishPending(revocRegId);
          }}
        />

        <CreateRegistryDialog
          open={isCreateRegDialogOpen}
          handleClose={() => setIsCreateRegDialogOpen(false)}
          onCreateReg={(obj) => onCreateReg(obj)}
        />
        <PublishAllDialog
          open={isPublishAllDialogOpen}
          handleClose={() => setIsPublishAllDialogOpen(false)}
          onPublishAll={() => onPublishPending(null)}
        />
        <RevokeCredentialDialog
          open={isRevokeCredDialogOpen}
          handleClose={() => setIsRevokeCredDialogOpen(false)}
          onRevokeCred={(credRevId, publish) => onRevokeCred(selectedRevocReg, credRevId, publish)}
        />
      </RegistriesTableDiv>
    </RegistriesPage>
  );
};

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withSnackbar(MyRegistries));
