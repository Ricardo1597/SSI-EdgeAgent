import React, { Component, useEffect, Fragment } from 'react';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel, { a11yProps } from '../../TabPanel';
import Button from '@material-ui/core/Button';

import SeeCredentials from './components/SeeCredentials';
import ProposeCredential from './components/ProposeCredential';
import OfferCredential from './components/OfferCredential';
import AllRecords from './components/AllRecords/index';
import qs from 'qs';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../config';

import { connect } from 'react-redux';

import io from 'socket.io-client';
let socket;

function CredentialNotifications({ updateExchange }) {
  useEffect(() => {
    socket = io(config.agentEndpoint);
    return () => {
      socket.emit('disconnect');
      socket.off();
    };
  }, [config.agentEndpoint]);

  useEffect(() => {
    socket.on('notification', (notification) => {
      if (notification.protocol === 'credential') {
        // If it is a credential exchange notification, update record
        updateExchange(notification.record);
      }
    });
  }, []);

  return null;
}

class Credentials extends Component {
  state = {
    exchanges: [],
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

  componentWillMount() {
    const jwt = this.props.accessToken;

    axios
      .get(`${config.endpoint}/api/credential-exchanges`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then(({ data: { records } }) => {
        console.log('Credentials: ', records);
        this.setState({
          exchanges: records || [],
        });
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant(
          'Error getting credentials exchanges records. Please try again.',
          'error'
        );
      });
  }

  addExchange = (record) => {
    console.log('No add', record);
    this.setState({
      exchanges: [...this.state.exchanges, record].sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : 1
      ),
    });
  };

  updateExchange = (record) => {
    console.log('No update', record);
    let found = false;
    let exchanges = this.state.exchanges.map((exchange) => {
      if (exchange.credentialExchangeId === record.credentialExchangeId) {
        found = true;
        if (exchange.state !== 'done') return record;
      }
      return exchange;
    });

    // Add a new one if none was found
    if (!found) {
      exchanges = [...exchanges, record].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
    }
    this.setState({ exchanges });
  };

  removeExchange = (recordId) => {
    console.log('No remove', recordId);
    this.setState({
      exchanges: this.state.exchanges.filter(
        (exchange) => exchange.credentialExchangeId === recordId
      ),
    });
  };

  getDIDPermissions = () => {
    const dids = JSON.parse(localStorage.getItem('dids'));
    return dids && dids.filter((did) => did.role !== null && did.role !== 'no role').length > 0
      ? true
      : false;
  };

  handleChangeTabs = (e, newValue) => {
    this.props.history.push(`/credentials?tab=${newValue}`);
  };

  render() {
    const { classes } = this.props;
    const search = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
    const tab = parseInt(search.tab) || 0;
    const recordId = search.recordId;
    const connectionId = search.connectionId || null;

    return (
      <div
        className={`${classes.root} root-background`}
        style={{ minHeight: 'calc(100vh - 50px)' }}
      >
        <CredentialNotifications updateExchange={this.updateExchange} />
        <AppBar position="static" color="default">
          <Tabs
            value={tab}
            onChange={this.handleChangeTabs}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab className={classes.button} label="Credential Exchanges" {...a11yProps(0)} />
            <Tab className={classes.button} label="Credentials" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={tab} index={0}>
          <AllRecords
            exchanges={this.state.exchanges}
            recordId={recordId}
            updateExchange={this.updateExchange}
            removeExchange={this.removeExchange}
          />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <SeeCredentials addExchange={this.addExchange} />
        </TabPanel>
      </div>
    );
  }
}

// Styles
const useStyles = (theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  paper: {
    marginTop: 30,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '500px',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(Credentials)));
