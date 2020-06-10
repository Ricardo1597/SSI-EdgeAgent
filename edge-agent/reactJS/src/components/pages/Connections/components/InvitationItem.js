import React, { Component } from 'react'
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';


export class InvitationItem extends Component {

    render() {
        const { isPublic, alias } = this.props.invitation;
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
                    <Typography variant='body2' color="textPrimary">
                        {isPublic ? "public" : "private"}
                    </Typography>
                </CardContent>
            </Card>
        )
    }
}

// Prop types
InvitationItem.propTypes = {
    invitation: PropTypes.object.isRequired
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
  
export default connect(mapStateToProps)(InvitationItem)