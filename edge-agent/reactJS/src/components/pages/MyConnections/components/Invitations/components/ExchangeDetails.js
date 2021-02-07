import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import JSONPretty from 'react-json-pretty';

import styled from 'styled-components';

import { connect } from 'react-redux';

const InvitationDetailsDiv = styled.div`
  margin: 10px !important;
  background-color: white;
  border-radius: 10px;
`;

function InvitationDetails(props) {
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
    <InvitationDetailsDiv>
      <CardContent className="m-2 pb-2">
        <Typography gutterBottom variant="h6" component="h2">
          {alias || invitationId}
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
            <JSONPretty data={invitation}></JSONPretty>
          </div>
        </Typography>
      </CardContent>
    </InvitationDetailsDiv>
  );
}

// Prop types
InvitationDetails.propTypes = {
  invitation: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(InvitationDetails);
