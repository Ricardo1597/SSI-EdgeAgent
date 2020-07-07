import React from 'react'
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';


function ConnectionItem(props) {
    const classes = useStyles();
    const { state, alias } = props.connection;

    return (             
        <Card className={classes.root + `${props.selected ? " block-example border border-primary" : ""}`}>
            <CardContent>
                <Typography style={{marginBottom: '-15px'}} variant="h6">
                    <p>{alias}</p>
                </Typography>
                <Typography variant='subtitle2' color="textSecondary">
                    Hardcoded for created_at<br/>
                    Hardcoded for updated_at
                </Typography>
            </CardContent>
        </Card>
    )
}

// Prop types
ConnectionItem.propTypes = {
    connection: PropTypes.object.isRequired
}


const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 400,
        borderRadius: 20,
        margin: 20,
    },
    content: {
        padding: 24,
    },
}));


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(ConnectionItem)