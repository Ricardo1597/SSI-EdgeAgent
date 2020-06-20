import React, { Component } from 'react'

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel, { a11yProps } from '../../TabPanel'
import { withStyles } from '@material-ui/core/styles';

import MyRegistries from './components/MyRegistries'
import GetRegistry from './components/GetRegistry'
import CreateRegistry from './components/CreateRegistry';
import RevokeCredential from './components/RevokeCredential';


class Revocations extends Component {
    state = {
        tab: 0,
    }


    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleChangeTabs = (e, newValue) => {
        this.setState({tab: newValue})
    }


    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static" color="default">
                    <Tabs
                        value={this.state.tab}
                        onChange={this.handleChangeTabs}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab className={classes.button} label="My Registries" {...a11yProps(1)} />
                        <Tab className={classes.button} label="Get Registry" {...a11yProps(0)} />
                        <Tab className={classes.button} label="Create Registry" {...a11yProps(2)} />
                        <Tab className={classes.button} label="Revoke Credential" {...a11yProps(3)} />
                    </Tabs>
                </AppBar>
                <TabPanel value={this.state.tab} index={0}>
                    <MyRegistries/>
                </TabPanel>
                <TabPanel value={this.state.tab} index={1}>
                    <GetRegistry/>
                </TabPanel>
                <TabPanel value={this.state.tab} index={2}>
                    <CreateRegistry/>
                </TabPanel>
                <TabPanel value={this.state.tab} index={3}>
                    <RevokeCredential/>
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
        backgroundColor: theme.palette.background.paper,
      },
    button : {
        "&:focus": {
            outline:"none",
        }
    },
});

  
export default withStyles(useStyles)(Revocations);