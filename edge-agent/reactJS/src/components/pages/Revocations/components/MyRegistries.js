import React, { Component, Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import PublishIcon from '@material-ui/icons/Publish';

import RegistriesTable from './RegistriesTable';
import PublishAllDialog from './PublishAllDialog';
import CreateRegistryDialog from './CreateRegistryDialog';
import RevokeCredentialDialog from './RevokeCredentialDialog';

import axios from 'axios';
import config from '../../../../config';

const columns = [
  { id: 'name', label: 'Name', width: '26%' },
  { id: 'issuanceType', label: 'Issuance', width: '24%' },
  { id: 'maxCredNum', label: 'Capacity', width: '12%' },
  { id: 'currCredNum', label: 'Slots Used', width: '12%' },
  { id: 'state', label: 'State', width: '14%' },
  { id: 'pendingRevocations', label: 'Pending', width: '12%' },
];

class MyRegistries extends Component {
  state = {
    createRegDialogOpen: false,
    revokeCredDialogOpen: false,
    publishAllDialogOpen: false,
    selectedRevocReg: null,
  };

  showSnackbarVariant = (message, variant) => {
    this.props.enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: this.action,
    });
  };

  action = (key) => (
    <Fragment>
      <Button
        style={{ color: 'white' }}
        onClick={() => {
          this.props.closeSnackbar(key);
        }}
      >
        <strong>Dismiss</strong>
      </Button>
    </Fragment>
  );

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  onCreateReg = ({ credDefId, name, issuanceByDefault, maxCredNum }) => {
    console.log('In create reg action: ', credDefId, issuanceByDefault, maxCredNum);

    const jwt = this.props.accessToken;

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
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { record } }) => {
        console.log(record);
        this.props.addRecord(record);
        this.showSnackbarVariant('Registry created.', 'success');
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error creating registry. Please try again.', 'error');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  onRevokeCred = (revocRegId, credRevId, publish) => {
    console.log('In revoke action: ', revocRegId, credRevId, publish);

    const jwt = this.props.accessToken;

    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/revoke`,
        {
          revocRegId,
          publish,
          credRevId,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { invalidCredRevIds } }) => {
        console.log('invalidCredRevIds: ', invalidCredRevIds);
        if (!publish) {
          this.props.updatePending(revocRegId, credRevId);
          this.showSnackbarVariant('Credential added to pending list.', 'success');
        } else if (invalidCredRevIds.length) {
          this.showSnackbarVariant(
            'Error revoking credential: invalid credential revocation ID.',
            'error'
          );
        } else {
          this.showSnackbarVariant('Credential revoked.', 'success');
        }
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error revoking credential. Please try again.', 'error');
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  onPublishPending = (revocRegId) => {
    console.log('In publish pending action: ', revocRegId);

    const jwt = this.props.accessToken;

    axios
      .post(
        `${config.endpoint}/api/credential-exchanges/${
          revocRegId ? revocRegId + '/' : ''
        }publish-revocations`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then(({ data: { invalidCredRevIds } }) => {
        console.log(invalidCredRevIds);
        this.showSnackbarVariant('Credentials revoked.', 'success');
        this.props.cleanPending(revocRegId);
        if (Object.keys(invalidCredRevIds).length) {
          this.showSnackbarVariant(
            'Some credentials were invalid:' + JSON.stringify(invalidCredRevIds),
            'warning'
          );
        }
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error revoking credentials. Please try again.', 'error');
      });
  };

  render() {
    const { classes, myRegistries } = this.props;

    return (
      <div className={classes.paper}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 200, marginBottom: 15 }}>
            <Typography component="span" variant="h5" style={{ marginLeft: 25 }}>
              <strong>My Registries</strong>
            </Typography>
          </div>
          <div
            style={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', marginRight: 40 }}
          >
            <Button
              type="button"
              variant="contained"
              style={{
                width: 170,
                marginRight: 10,
                height: 35,
                backgroundColor: '#24a0ed',
                color: 'white',
              }}
              onClick={() => {
                this.setState({ createRegDialogOpen: true });
              }}
            >
              <AddCircleOutlineIcon fontSize="small" style={{ marginRight: 5 }} /> New Registry
            </Button>
            <Tooltip title="Publish all pending revocations">
              <Button
                type="button"
                variant="contained"
                color="primary"
                style={{ width: 151, height: 35, backgroundColor: '#8884FF', color: 'white' }}
                onClick={() => {
                  this.setState({ publishAllDialogOpen: true });
                }}
              >
                <PublishIcon fontSize="small" style={{ marginRight: 5 }} /> Publish All
              </Button>
            </Tooltip>
          </div>
        </div>
        <Container maxWidth="100%">
          <div style={{ width: '100%' }}>
            <RegistriesTable
              columns={columns}
              rows={(myRegistries || [])
                .sort((a, b) =>
                  a.updatedAt > b.updatedAt ? -1 : b.updatedAt > a.updatedAt ? 1 : 0
                )
                .map((registry) => {
                  return {
                    name: registry.name,
                    issuanceType: registry.issuanceType,
                    maxCredNum: registry.maxCredNum,
                    currCredNum: registry.currCredNum,
                    state: registry.state,
                    pendingRevocations: registry.pendingPub.length,
                    did: registry.issuerDid,
                    registry: registry,
                  };
                })}
              rowHeight={50}
              onRevokeCredential={(revocRegId) => {
                this.setState({ selectedRevocReg: revocRegId, revokeCredDialogOpen: true });
              }}
              onPublishPending={(revocRegId) => {
                this.onPublishPending(revocRegId);
              }}
            />
          </div>
        </Container>

        <CreateRegistryDialog
          open={this.state.createRegDialogOpen}
          handleClose={() => {
            this.setState({ createRegDialogOpen: false });
          }}
          onCreateReg={(obj) => this.onCreateReg(obj)}
        />
        <PublishAllDialog
          open={this.state.publishAllDialogOpen}
          handleClose={() => {
            this.setState({ publishAllDialogOpen: false });
          }}
          onPublishAll={() => this.onPublishPending(null)}
        />
        <RevokeCredentialDialog
          open={this.state.revokeCredDialogOpen}
          handleClose={() => {
            this.setState({ revokeCredDialogOpen: false });
          }}
          onRevokeCred={(credRevId, publish) =>
            this.onRevokeCred(this.state.selectedRevocReg, credRevId, publish)
          }
        />
      </div>
    );
  }
}

// Styles
const useStyles = (theme) => ({
  paper: {
    padding: 30,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  button: {
    height: '40px',
    width: '500px',
    marginTop: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(MyRegistries)));
