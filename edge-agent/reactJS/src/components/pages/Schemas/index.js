import React, { Component } from 'react'

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel, { a11yProps } from '../../TabPanel'
import { withStyles } from '@material-ui/core/styles';

import GetSchema from './components/GetSchema'
import CreateSchema from './components/CreateSchema'
import CreateCredDef from './components/CreateCredDef';


class Schema extends Component {
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
                        <Tab className={classes.button} label="Get Schema" {...a11yProps(0)} />
                        <Tab className={classes.button} label="Create Schema" {...a11yProps(1)} />
                        <Tab className={classes.button} label="Create Cred Def" {...a11yProps(2)} />
                    </Tabs>
                </AppBar>
                <TabPanel value={this.state.tab} index={0}>
                    <GetSchema/>
                </TabPanel>
                <TabPanel value={this.state.tab} index={1}>
                    <CreateSchema/>
                </TabPanel>
                <TabPanel value={this.state.tab} index={2}>
                    <CreateCredDef/>
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

  
export default withStyles(useStyles)(Schema)