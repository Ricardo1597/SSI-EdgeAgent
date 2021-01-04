import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

export default function RecordSummary({ record, selected }) {
  const classes = useStyles();
  const { id, createdAt, updatedAt, state } = record;

  return (
    <Card
      className={classes.root}
      style={{
        boxShadow: `${selected ? '0px 0px 8px -2px #0033ee' : 'none'}`,
      }}
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
          <div style={{ display: 'flex', marginBottom: -5 }}>
            <div style={{ fontWeight: 'bold' }}>Current state: &nbsp;</div>
            {state}
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
    width: 330,
    borderRadius: 10,
    margin: 20,
    marginRight: 15,
    backgroundColor: '#f8f9ff',
    borderColor: '#d4dcff',
    borderWidth: 2,
    borderStyle: 'solid',
  },
}));
