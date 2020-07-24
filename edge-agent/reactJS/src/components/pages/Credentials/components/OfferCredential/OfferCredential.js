import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import StepForm from './StepForm/StepForm';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const OfferCredential = ({ classes }) => {
  return (
    <Container spacing={2}>
      <div className={classes.paper}>
        <Paper className={`${classes.paper} p-5`} style={{ width: 500 }}>
          <Typography component="span" variant="h5">
            Offer Credential
          </Typography>
          <StepForm />
        </Paper>
      </div>
    </Container>
  );
};

// Styles
const useStyles = (theme) => ({
  paper: {
    marginTop: 20,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export default withStyles(useStyles)(OfferCredential);
