import React, { Component, Fragment } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Button from '@material-ui/core/Button';
import Tab from '@material-ui/core/Tab';
import TabPanel, { a11yProps } from '../../TabPanel';
import { withStyles } from '@material-ui/core/styles';

import MyRegistries from './components/MyRegistries';
import { withSnackbar } from 'notistack';
import { connect } from 'react-redux';

import axios from 'axios';
import config from '../../../config';

class Revocations extends Component {
  state = {
    registries: [],
    tab: 0,
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

  handleChangeTabs = (e, newValue) => {
    this.setState({ tab: newValue });
  };

  addRecord = (record) => {
    this.setState({ registries: [...this.state.registries, record] });
  };

  updatePending = (id, credRevId) => {
    let registries = this.state.registries;
    for (let i = 0; i < registries.length; i++) {
      if (registries[i].revocRegId === id) {
        registries[i].hasPendingRevocations = true;
        registries[i].pendingPub = [...registries[i].pendingPub, credRevId];
        break;
      }
    }
    this.setState({ registries });
  };

  cleanPending = (id) => {
    let registries = this.state.registries;
    if (!id) {
      registries.map((registry) => {
        return { ...registry, hasPendingRevocations: false, pendingPub: [] };
      });
    } else {
      for (let i = 0; i < registries.length; i++) {
        if (registries[i].revocRegId === id) {
          registries[i].hasPendingRevocations = false;
          registries[i].pendingPub = [];
          break;
        }
      }
    }
    this.setState({ registries });
  };

  componentWillMount() {
    const jwt = this.props.accessToken;

    axios
      .get(`${config.endpoint}/api/revocation/registries/created`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        console.log(res.data);
        this.setState({
          registries: res.data.records,
        });
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant(
          'Error getting revocation registries. Please refresh the page.',
          'error'
        );
      });
  }

  render() {
    const { classes } = this.props;

    return (
      <div
        className={`${classes.root} root-background`}
        style={{ minHeight: 'calc(100vh - 50px)' }}
      >
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.tab}
            onChange={this.handleChangeTabs}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab className={classes.button} label="My Registries" {...a11yProps(0)} />
          </Tabs>
        </AppBar>
        <TabPanel value={this.state.tab} index={0}>
          <MyRegistries
            myRegistries={this.state.registries}
            addRecord={this.addRecord}
            updatePending={this.updatePending}
            cleanPending={this.cleanPending}
          />
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
  button: {
    '&:focus': {
      outline: 'none',
    },
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(Revocations)));
