import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel, { a11yProps } from '../../TabPanel'

import { connect } from 'react-redux';

import ActiveConnections from './components/ActiveConnections'
import PendingConnections from './components/PendingConnections';
import CreateInvitation from './components/CreateInvitation'
import ReceiveInvitation from './components/ReceiveInvitation'
import Invitations from './components/Invitations';
import qs from 'qs'


class Connections extends Component {

    handleChangeTabs = (e, newValue) => {
        this.props.history.push(`/connections?tab=${newValue}`);
    }


    render() {
        const { classes } = this.props
        const search = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })
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
                        <Tab className={classes.button} label="Active Connections" {...a11yProps(0)} />
                        <Tab className={classes.button} label="Pending Connections" {...a11yProps(1)} />
                        <Tab className={classes.button} label="Invitations" {...a11yProps(2)} />
                        <Tab className={classes.button} label="Create invitation" {...a11yProps(3)} />
                        <Tab className={classes.button} label="Receive invitation" {...a11yProps(4)} />
                    </Tabs>
                </AppBar>
                <TabPanel value={tab} index={0}>
                    <ActiveConnections/>
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    <PendingConnections/>
                </TabPanel>
                <TabPanel value={tab} index={2}>
                    <Invitations/>
                </TabPanel>
                <TabPanel value={tab} index={3}>
                    <CreateInvitation/>
                </TabPanel>
                <TabPanel value={tab} index={4}>
                    <ReceiveInvitation/>
                </TabPanel>            
            </div>
        )
    }
}



// Styles
const useStyles = theme => ({
    root: {
      flexGrow: 1,
      width: '100%',
      height: '100%',
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
    button : {
        "&:focus": {
            outline:"none",
        }
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
        marginTop: 10
    },
    jsonBox: {
        marginTop: -10,
    },
    leftMargin: {
        marginLeft: 10,
        marginBottom: -10
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
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(withStyles(useStyles)(Connections))
