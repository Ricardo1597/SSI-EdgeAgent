import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../config';

import { connect } from 'react-redux';

const useStyles = makeStyles({
  root: {
    minWidth: 400,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

function PresentationCard(props) {
  const classes = useStyles();

  const showSnackbarVariant = (message, variant) => {
    props.enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: action,
    });
  };

  const action = (key) => (
    <Fragment>
      <Button
        style={{ color: 'white' }}
        onClick={() => {
          props.closeSnackbar(key);
        }}
      >
        <strong>Dismiss</strong>
      </Button>
    </Fragment>
  );

  const verifyPresentation = (recordId) => {
    const jwt = props.accessToken;
    axios
      .post(
        `${config.endpoint}/api/presentation-exchanges/${recordId}/verify-presentation`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  console.log(props.presentation);
  console.log(props.request);

  return (
    <Card className="p-2" variant="outlined">
      <CardContent>
        <Typography style={{ marginBottom: '5px' }} variant="h6">
          {props.request.name}
        </Typography>
        {Object.entries(props.presentation.requested_proof.revealed_attrs).map(([key, value]) => {
          const nonRevoked = props.request.requested_attributes[key].non_revoked;
          const startDate = nonRevoked
            ? new Date(0).setSeconds(nonRevoked.from * 1000)
            : new Date(0);
          const endDate = nonRevoked
            ? new Date(0).setSeconds(nonRevoked.to * 1000)
            : props.request.date
            ? new Date(props.request.date * 1000)
            : new Date();
          return (
            <Typography key={key}>
              {props.request.requested_attributes[key].name}: {value.raw} <br />
              {/*<sup>{`* Validating between: ${startDate.toUTCString()} and ${endDate.toUTCString()}`}</sup>*/}
            </Typography>
          );
        })}
        {Object.values(props.request.requested_predicates).map((attr) => {
          const nonRevoked = attr.non_revoked;
          const startDate = nonRevoked
            ? new Date(0).setSeconds(nonRevoked.from * 1000)
            : new Date(0);
          const endDate = nonRevoked
            ? new Date(0).setSeconds(nonRevoked.to * 1000)
            : props.request.date
            ? new Date(props.request.date * 1000)
            : new Date();

          return (
            <Typography key={attr.name}>
              {`${attr.name}: ${attr.p_type} ${attr.p_value}`} <br />
              {/*<sup>{`* Validating between: ${startDate.toUTCString()} and ${endDate.toUTCString()}`}</sup>*/}
            </Typography>
          );
        })}
        {/* {props.verified === 'true' && (
          <img src="http://localhost:3000/valid-stamp.jpg" width={80} alt="Invalid Presentation" />
        )}
        {props.verified === 'false' && (
          <img
            src="http://localhost:3000/invalid-stamp.jpg"
            width={80}
            alt="Invalid Presentation"
          />
        )} */}
      </CardContent>
      <CardActions className="ml-2">
        {props.verified == null ? (
          <Button size="small" color="primary" onClick={() => verifyPresentation(props.id)}>
            Verify Presentation
          </Button>
        ) : props.verified === 'true' ? (
          <p style={{ color: 'green' }}>Presentation verified</p>
        ) : (
          <p style={{ color: 'red' }}>Presentation invalid</p>
        )}
      </CardActions>
    </Card>
  );
}

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withSnackbar(PresentationCard));
