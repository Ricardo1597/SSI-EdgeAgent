import React from 'react'
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';


function ActiveConnectionActions(props) {
    const classes = useStyles();

    {/* This is just a template *NOT IN USE* */}

    const { state, initiator, connectionId } = props.connection;

    if(initiator === "external") {
        switch(state) {
            case 'x':
                return <Button size="small" color="primary" >Text</Button>;
            case 'y':
                return <Button size="small" color="primary" >Text</Button>;
            default:
                return null;
        }
    } else {
        switch(state) {
            case 'z':
                return <Button size="small" color="primary" >Text</Button>;
            default:
                return null;
        }
    }
}

// Prop types
ActiveConnectionActions.propTypes = {
    connection: PropTypes.object.isRequired
}


// Styles
const useStyles = makeStyles((theme) => ({
    button : {
        "&:focus": {
            outline:"none",
        }
    },    
}));


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(ActiveConnectionActions);



