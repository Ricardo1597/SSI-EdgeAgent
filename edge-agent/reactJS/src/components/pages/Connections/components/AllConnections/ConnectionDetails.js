import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';

const ConnectionDetailsDiv = styled.div`
  margin: 10px !important;
  background-color: white;
  border-radius: 10px;
`;

function ConnectionDetails({ connection }) {
  const classes = useStyles();
  const { state, stateToDisplay, theirAlias, connectionId, myDid, myVerkey, error } = connection;

  return (
    <ConnectionDetailsDiv>
      <CardContent className="m-2 pb-2">
        <div className="scrollBar" style={{ overflowY: 'scroll', height: 'calc(80vh - 45px)' }}>
          <Typography gutterBottom variant="h6" component="h2">
            {theirAlias}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 'bold' }}>Connection ID:</div>
              {connectionId}
            </div>
            {myDid ? (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 'bold' }}>My DID:</div>
                  {myDid}
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 'bold' }}>My Verkey:</div>
                  {myVerkey}
                </div>
              </div>
            ) : null}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 'bold' }}>Current State:</div>
              {stateToDisplay}
            </div>
            {state === 'error' && error && error.description && error.description.en ? (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 'bold' }}>Error:</div>
                {error.description.en}
              </div>
            ) : null}
          </Typography>
        </div>
      </CardContent>
    </ConnectionDetailsDiv>
  );
}

// Prop types
ConnectionDetails.propTypes = {
  connection: PropTypes.object.isRequired,
};

// Styles
const useStyles = makeStyles((theme) => ({
  button: {
    '&:focus': {
      outline: 'none',
    },
  },
}));

export default ConnectionDetails;
