import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';


export class RecordSummary extends Component {

    render() {
        const { id } = this.props.record;
        return (                  
            <Card style={styles.root}>
                <CardContent>
                    <Typography style={{marginBottom: 8}} variant="body2">
                        {id}
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
RecordSummary.propTypes = {
    record: PropTypes.object.isRequired
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
  
export default connect(mapStateToProps)(RecordSummary)