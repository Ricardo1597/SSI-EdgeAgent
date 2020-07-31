import React from 'react';
import PropTypes from 'prop-types';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

function ConnectionDetails(props) {
  const classes = useStyles();
  const { state, theirAlias, connectionId, myDid, myVerkey, error } = props.connection;

  return (
    <div>
      <CardContent>
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
            {state}
          </div>
          {state === 'error' && error && error.description && error.description.en ? (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 'bold' }}>Error:</div>
              {error.description.en}
            </div>
          ) : null}
        </Typography>
      </CardContent>
    </div>
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

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(ConnectionDetails);
