import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import StepForm from './StepForm/StepForm';

const OfferCredential = ({ classes, connectionId, addExchange }) => {
  return (
    <Container className="p-0">
      <div className={classes.paper}>
        <Paper className={`${classes.paper} p-5`} style={{ width: 500 }}>
          <Typography component="span" variant="h5">
            Offer Credential
          </Typography>
          <StepForm connectionId={connectionId} addExchange={addExchange} />
        </Paper>
      </div>
    </Container>
  );
};

// Styles
const useStyles = (theme) => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export default withStyles(useStyles)(OfferCredential);
