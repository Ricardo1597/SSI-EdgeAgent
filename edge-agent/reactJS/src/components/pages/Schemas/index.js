import React, { Component } from 'react'

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel, { a11yProps } from '../../TabPanel'
import { withStyles } from '@material-ui/core/styles';

import GetSchema from './components/GetSchema'
import CreateSchema from './components/CreateSchema'
import CreateCredDef from './components/CreateCredDef';
import qs from 'qs';

class Schema extends Component {

    handleChangeTabs = (e, newValue) => {
        this.props.history.push(`/schemas?tab=${newValue}`);
    }

    getDIDPermissions = () => {
        const dids = JSON.parse(localStorage.getItem('dids'));
        return (dids && dids.filter(did => (did.role !== null) && (did.role !== "no role")).length > 0) ? true : false
    }

    render() {
        const { classes } = this.props;
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
                        <Tab className={classes.button} label="Get Schema" {...a11yProps(0)} />
                        { this.getDIDPermissions()
                            ? <Tab className={classes.button} label="Create Schema" {...a11yProps(1)} />
                            : null
                        }               
                        { this.getDIDPermissions()
                            ? <Tab className={classes.button} label="Create Cred Def" {...a11yProps(2)} />
                            : null
                        }
                    </Tabs>
                </AppBar>
                <TabPanel value={tab} index={0}>
                    <GetSchema/>
                </TabPanel>
                { this.getDIDPermissions()
                    ? (
                        <TabPanel value={tab} index={1}>
                            <CreateSchema/>
                        </TabPanel>
                    ) : null
                }
                { this.getDIDPermissions()
                    ? (
                        <TabPanel value={tab} index={2}>
                            <CreateCredDef/>
                        </TabPanel>
                    ) : null
                }
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