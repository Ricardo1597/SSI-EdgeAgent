import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel, { a11yProps } from '../../TabPanel';

import { connect } from 'react-redux';

import SeeCredentials from './components/SeeCredentials';
import ProposeCredential from './components/ProposeCredential/ProposeCredential';
import OfferCredential from './components/OfferCredential/OfferCredential';
import AllRecords from './components/AllRecords';
import qs from 'qs';

class Credentials extends Component {
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

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs
            value={tab}
            onChange={this.handleChangeTabs}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab className={classes.button} label="Credentials" {...a11yProps(0)} />
            <Tab className={classes.button} label="Credential Exchanges" {...a11yProps(1)} />
            <Tab className={classes.button} label="Propose Credential" {...a11yProps(2)} />
            {this.getDIDPermissions() ? (
              <Tab className={classes.button} label="Offer Credential" {...a11yProps(3)} />
            ) : null}
          </Tabs>
        </AppBar>
        <TabPanel value={tab} index={0}>
          <SeeCredentials />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <AllRecords recordId={search.recordId} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <ProposeCredential />
        </TabPanel>
        {this.getDIDPermissions() ? (
          <TabPanel value={tab} index={3}>
            <OfferCredential />
          </TabPanel>
        ) : null}
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

export default connect(mapStateToProps)(withStyles(useStyles)(Credentials));
