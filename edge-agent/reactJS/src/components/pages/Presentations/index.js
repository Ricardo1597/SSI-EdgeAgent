import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel, { a11yProps } from '../../TabPanel'

import { connect } from 'react-redux';

import ProposePresentation from './components/ProposePresentation'
import RequestPresentation from './components/RequestPresentation'
import SendPresentation from './components/SendPresentation'
import AllRecords from '../Presentations/components/AllRecords';



class Presentations extends Component {
    state = {
        tab: 0,
        recordId: null
    }

    handleChangeTabs = (e, newValue, recordId=null) => {
        this.setState({
            tab: newValue,
            recordId: recordId
        })
    }


    render() {
        const { classes } = this.props
        return (
            <div className={classes.root}>
                <AppBar position="static" color="default">
                    <Tabs
                        value={this.state.tab}
                        onChange={this.handleChangeTabs}
                        indicatorColor={this.state.tab!==3 ? "primary" : "transparent"}
                        textColor="primary"
                    >
                        <Tab className={classes.button} label="Presentation Exchanges" {...a11yProps(0)} />
                        <Tab className={classes.button} label="Propose Presentation" {...a11yProps(1)} />
                        <Tab className={classes.button} label="Request Presentation" {...a11yProps(2)} />
                        <Tab style={{visibility: 'hidden'}}/>
                    </Tabs>
                </AppBar>
                <TabPanel value={this.state.tab} index={0}>
                    <AllRecords changeTabs={this.handleChangeTabs}/>
                </TabPanel>
                <TabPanel value={this.state.tab} index={1}>
                    <ProposePresentation/>
                </TabPanel>
                <TabPanel value={this.state.tab} index={2}>
                    <RequestPresentation recordId={this.state.recordId}/>
                </TabPanel>
                <TabPanel value={this.state.tab} index={3}>
                    <SendPresentation recordId={this.state.recordId}/>
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
  
export default connect(mapStateToProps)(withStyles(useStyles)(Presentations))
