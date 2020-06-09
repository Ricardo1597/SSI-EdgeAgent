import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import axios from 'axios'
import config from '../../../../config'
import { connect } from 'react-redux';


export class ConnectionItem extends Component {

    render() {
        const { state, alias } = this.props.connection;
        return (                  
            <Card style={styles.root}>
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
}

// Prop types
ConnectionItem.propTypes = {
    connection: PropTypes.object.isRequired
}


const styles = ({
    root: {
        maxWidth: 400,
        borderRadius: 20,
        margin: 20,
    },
    content: {
        padding: 24,
    },
});


const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(ConnectionItem)