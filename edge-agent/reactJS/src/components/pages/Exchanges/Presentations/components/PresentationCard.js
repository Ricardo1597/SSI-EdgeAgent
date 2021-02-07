import React, { useState } from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../../../../config';

import { connect } from 'react-redux';
import styled from 'styled-components';

const MyCard = styled(Card)`
  width: 560px;
`;

// const transformDate = (string) => {
//   return string.toISOString().replace('T', ' @ ');
// };

function PresentationCard(props) {
  const [valid, setValid] = useState(null);
  const showSnackbarVariant = (message, variant) => {
    props.enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: (key) => (
        <>
          <Button
            style={{ color: 'white' }}
            onClick={() => {
              props.closeSnackbar(key);
            }}
          >
            <strong>Dismiss</strong>
          </Button>
        </>
      ),
    });
  };

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
      .then(({ data: { verified } }) => {
        if (verified) {
          setValid(true);
          showSnackbarVariant('Presentation is valid!', 'success');
        } else {
          setValid(false);
          showSnackbarVariant('Presentation is invalid!', 'error');
        }
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant('Error verifying the presentation. Please try again later.', 'error');
      });
  };

  console.log(props.presentation);
  console.log(props.request);

  return (
    <MyCard className="p-2" variant="outlined">
      <CardContent>
        <Typography style={{ marginBottom: '5px' }} variant="h6">
          {props.request.name}
        </Typography>
        {Object.entries(props.presentation.requested_proof.revealed_attrs).map(([key, value]) => {
          const nonRevoked = props.request.requested_attributes[key].non_revoked;
          console.log(nonRevoked);
          let startDate = new Date(0);
          if (nonRevoked) startDate.setSeconds(nonRevoked.from);

          let endDate = new Date(0);
          if (nonRevoked) endDate.setSeconds(nonRevoked.to);
          else if (props.request.date) endDate.setSeconds(props.request.date);

          return (
            <Typography key={key}>
              {props.request.requested_attributes[key].name}: {value.raw} <br />
              <sup>{`* Validating between: ${startDate.toUTCString()} and ${endDate.toUTCString()}`}</sup>
            </Typography>
          );
        })}
        {Object.values(props.request.requested_predicates).map((attr) => {
          const nonRevoked = attr.non_revoked;
          let startDate = new Date(0);
          if (nonRevoked) startDate.setSeconds(nonRevoked.from);

          let endDate = new Date(0);
          if (nonRevoked) endDate.setSeconds(nonRevoked.to);
          else if (props.request.date) endDate.setSeconds(props.request.date);

          return (
            <Typography key={attr.name}>
              {`${attr.name}: ${attr.p_type} ${attr.p_value}`} <br />
              <sup>{`* Validating between: ${startDate.toUTCString()} and ${endDate.toUTCString()}`}</sup>
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
        {valid === true ? (
          <p style={{ color: 'green' }}>Presentation is valid!</p>
        ) : valid === false ? (
          <p style={{ color: 'red' }}>Presentation is invalid!</p>
        ) : (
          <Button size="small" color="primary" onClick={() => verifyPresentation(props.id)}>
            Verify Presentation
          </Button>
        )}
      </CardActions>
    </MyCard>
  );
}

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withSnackbar(PresentationCard));
