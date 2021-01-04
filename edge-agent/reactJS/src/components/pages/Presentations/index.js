import React, { Component, useEffect, Fragment } from 'react';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel, { a11yProps } from '../../TabPanel';
import Button from '@material-ui/core/Button';

import axios from 'axios';
import config from '../../../config';

import { connect } from 'react-redux';

import ProposePresentation from './components/ProposePresentation';
import RequestPresentation from './components/RequestPresentation';
import SendPresentation from './components/SendPresentation';
import AllRecords from '../Presentations/components/AllRecords/index';
import qs from 'qs';
import { withSnackbar } from 'notistack';

import io from 'socket.io-client';
let socket;

function PresentationNotifications({ updateExchange }) {
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
        updateExchange(notification.record);
      }
    });
  }, []);

  return null;
}

class Presentations extends Component {
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
      .get(`${config.endpoint}/api/presentation-exchanges`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then(({ data: { records } }) => {
        this.setState({
          exchanges: records || [],
        });
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant(
          'Error getting presentation exchanges records. Please refresh the page.',
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
      if (exchange.presentationExchangeId === record.presentationExchangeId) {
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
        (exchange) => exchange.presentationExchangeId === recordId
      ),
    });
  };

  getExchange = (recordId) => {
    return this.state.exchanges.find((exchange) => exchange.presentationExchangeId === recordId);
  };

  getDIDPermissions = () => {
    const dids = JSON.parse(localStorage.getItem('dids'));
    return dids && dids.filter((did) => did.role !== null && did.role !== 'no role').length > 0
      ? true
      : false;
  };

  handleChangeTabs = (e, newValue, recordId = null) => {
    if (recordId) {
      this.props.history.push(`/presentations?tab=${newValue}&recordId=${recordId}`);
    } else {
      this.props.history.push(`/presentations?tab=${newValue}`);
    }
  };

  render() {
    const { classes } = this.props;
    const search = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
    const tab = parseInt(search.tab) || 0;
    const connectionId = search.connectionId || null;
    const recordId = search.recordId || null;

    return (
      <div
        className={`${classes.root} root-background`}
        style={{ minHeight: 'calc(100vh - 50px)' }}
      >
        <PresentationNotifications updateExchange={this.updateExchange} />
        <AppBar position="static" color="default">
          <Tabs
            value={tab}
            onChange={this.handleChangeTabs}
            indicatorColor={tab !== 3 ? 'primary' : 'transparent'}
            textColor="primary"
          >
            <Tab className={classes.button} label="Presentation Exchanges" {...a11yProps(0)} />
            <Tab className={classes.button} label="Propose Presentation" {...a11yProps(1)} />
            <Tab className={classes.button} label="Request Presentation" {...a11yProps(2)} />
            <Tab {...a11yProps(3)} style={{ visibility: 'hidden' }} />
          </Tabs>
        </AppBar>
        <TabPanel value={tab} index={0}>
          <AllRecords
            changeTabs={this.handleChangeTabs}
            exchanges={this.state.exchanges}
            recordId={recordId}
            removeExchange={this.removeExchange}
            updateExchange={this.updateExchange}
          />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <ProposePresentation
            connectionId={connectionId}
            record={this.getExchange(recordId)}
            addExchange={this.addExchange}
          />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <RequestPresentation
            connectionId={connectionId}
            record={this.getExchange(recordId)}
            addExchange={this.addExchange}
          />
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <SendPresentation record={this.getExchange(recordId)} />
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
  result: {
    margin: 30,
    display: 'flex',
    flexDirection: 'line',
    alignItems: 'center',
  },
  button: {
    '&:focus': {
      outline: 'none',
    },
  },
  form: {
    width: '500px',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  add: {
    height: '40px',
    marginTop: 10,
  },
  jsonBox: {
    marginTop: -10,
  },
  leftMargin: {
    marginLeft: 10,
    marginBottom: -10,
  },
  formControl: {
    width: '100%',
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(Presentations)));
