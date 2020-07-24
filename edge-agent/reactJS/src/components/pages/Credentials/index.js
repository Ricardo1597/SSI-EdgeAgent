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
            {!this.getDIDPermissions() ? (
              <Tab className={classes.button} label="Propose Credential" {...a11yProps(2)} />
            ) : (
              <Tab className={classes.button} label="Offer Credential" {...a11yProps(2)} />
            )}
            {/* don't show this for now (probably won't be needed)
                    <Tab className={classes.button} label="Request Credential" {...a11yProps(4)} />
                    <Tab className={classes.button} label="Issue Credential" {...a11yProps(5)} />*/}
          </Tabs>
        </AppBar>
        <TabPanel value={tab} index={0}>
          <SeeCredentials />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <AllRecords recordId={search.recordId} />
        </TabPanel>
        {!this.getDIDPermissions() ? (
          <TabPanel value={tab} index={2}>
            <ProposeCredential />
          </TabPanel>
        ) : (
          <TabPanel value={tab} index={2}>
            <OfferCredential />
          </TabPanel>
        )}
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
    accessToken: state.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(Credentials));
