import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

function ConnectionItem(props) {
  const classes = useStyles();
  const { state, theirAlias, connectionId, createdAt, updatedAt } = props.connection;

  return (
    <Card
      className={classes.root + `${props.selected ? ' block-example border border-primary' : ''}`}
    >
      <CardContent>
        <Typography style={{ marginBottom: '-15px' }} variant="h6">
          <p>{theirAlias}</p>
        </Typography>
        <Typography style={{ marginBottom: '-10px' }} variant="body2">
          <p>{connectionId}</p>
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Created at: {createdAt}
          <br />
          Updated at: {updatedAt}
        </Typography>
        <Typography style={{ marginTop: '5px', marginBottom: '-5px' }} variant="body2">
          Current state: {state}
        </Typography>
      </CardContent>
    </Card>
  );
}

// Prop types
ConnectionItem.propTypes = {
  connection: PropTypes.object.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 320,
    borderRadius: 20,
    margin: 20,
  },
}));

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(ConnectionItem);
