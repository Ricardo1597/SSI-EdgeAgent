import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

export default function RecordSummary(props) {
  const classes = useStyles();
  const { id, createdAt, updatedAt } = props.record;

  return (
    <Card
      className={classes.root + `${props.selected ? ' block-example border border-primary' : ''}`}
    >
      <CardContent>
        <Typography style={{ marginBottom: 8 }} variant="body2">
          {id}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          <div style={{ display: 'flex' }}>
            <div style={{ fontWeight: 'bold' }}>Created at: &nbsp;</div>
            {createdAt}
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ fontWeight: 'bold' }}>Updated at: &nbsp;</div>
            {updatedAt}
          </div>
        </Typography>
      </CardContent>
    </Card>
  );
}

// Prop types
RecordSummary.propTypes = {
  record: PropTypes.object.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 320,
    borderRadius: 20,
    margin: 20,
  },
}));
