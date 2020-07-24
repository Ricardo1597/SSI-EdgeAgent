import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import JSONPretty from 'react-json-pretty';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

function InvitationDetails(props) {
  const classes = useStyles();
  const {
    alias,
    invitationId,
    isMultiuse,
    timesUsed,
    myDid,
    myVerkey,
    isPublic,
    isActive,
    invitation,
  } = props.invitation;

  return (
    <div>
      <CardContent>
        <Typography gutterBottom variant="h6" component="h2">
          {alias}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="div">
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>Invitation ID:</div>
            {invitationId}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>My DID:</div>
            {myDid}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>My Verkey:</div>
            {myVerkey}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>Public:</div>
            {isPublic ? 'yes' : 'no'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>Multiuse:</div>
            {isMultiuse ? 'yes' : 'no'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>Times Used:</div>
            {timesUsed}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>Active:</div>
            {isActive ? 'yes' : 'no'}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 'bold' }}>Invitation:</div>
            <JSONPretty id="json-pretty" data={invitation}></JSONPretty>
          </div>
        </Typography>
      </CardContent>
    </div>
  );
}

// Prop types
InvitationDetails.propTypes = {
  invitation: PropTypes.object.isRequired,
};

// Styles
const useStyles = makeStyles((theme) => ({
  button: {
    '&:focus': {
      outline: 'none',
    },
  },
}));

const mapStateToProps = (state) => {
  return {
    accessToken: state.accessToken,
  };
};

export default connect(mapStateToProps)(InvitationDetails);
