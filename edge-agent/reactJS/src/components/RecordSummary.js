import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';


export class RecordSummary extends Component {

    render() {
        const { id, createdAt, updatedAt } = this.props.record;
        return (                  
            <Card style={styles.root}>
                <CardContent>
                    <Typography style={{marginBottom: 8}} variant="body2">
                        {id}
                    </Typography>
                    <Typography variant='subtitle2' color="textSecondary">
                        <div style={{display: "flex"}}>
                            <div style={{fontWeight: "bold"}}>Created at: &nbsp;</div>
                            {createdAt}
                        </div>
                        <div style={{display: "flex"}}>
                            <div style={{fontWeight: "bold"}}>Updated at: &nbsp;</div>
                            {updatedAt}
                        </div>
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