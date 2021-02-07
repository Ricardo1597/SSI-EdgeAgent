import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';

const MyCard = styled(Card)`
  cursor: pointer;
  &:hover {
    box-shadow: 0px 0px 16px -2px #888888 !important;
  }
`;

export default function RecordSummary({ record, selected }) {
  const classes = useStyles();
  const { title, createdAt, updatedAt, state } = record;

  return (
    <MyCard
      className={classes.root}
      style={{
        boxShadow: `${selected ? '0px 0px 10px -2px #888888' : 'none'}`,
      }}
    >
      <CardContent>
        <Typography style={{ marginBottom: 8 }} variant="body2">
          {title}
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
            {state ? (
              <>
                <div style={{ fontWeight: 'bold' }}>Current state: &nbsp;</div>
                {state}
              </>
            ) : null}
          </div>
        </Typography>
      </CardContent>
    </MyCard>
  );
}

// Prop types
RecordSummary.propTypes = {
  record: PropTypes.object.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: 330,
    borderRadius: 5,
    margin: 20,
    marginRight: 15,
    backgroundColor: '#f8f9ff',
    borderColor: '#d4dcff',
    borderWidth: 2,
    borderStyle: 'solid',
  },
}));
