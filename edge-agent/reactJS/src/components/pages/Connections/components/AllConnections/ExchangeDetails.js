import React from 'react';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';

import ConnectionDetails from './ConnectionDetails';
import ConnectionActions from './ConnectionActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import config from '../../../../../config';

const ExchangeDetails = ({
  exchange,
  updateExchange,
  removeExchange,
  showSnackbarVariant,
  accessToken,
}) => {
  const deleteRecord = (id) => {
    const jwt = accessToken;

    axios
      .delete(`${config.endpoint}/api/credential-exchanges/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then(({ data: { id } }) => {
        console.log(id);
        removeExchange(id);
        showSnackbarVariant('Credential exchange record deleted.', 'success');
      })
      .catch((err) => {
        console.error(err);
        showSnackbarVariant(
          'Error deleting credential exchange record. Please try again.',
          'error'
        );
      });
  };

  return exchange ? (
    <div>
      <Card>
        <ConnectionDetails connection={exchange} />
        <CardActions>
          <ConnectionActions
            connection={{
              id: exchange.connectionId,
              state: exchange.state,
              initiator: exchange.role,
            }}
            updateExchange={updateExchange}
          />
          <Button
            size="small"
            color="primary"
            onClick={() => deleteRecord(exchange.credentialExchangeId)}
          >
            Remove Record
          </Button>
        </CardActions>
      </Card>
    </div>
  ) : (
    <div align="center">
      <Typography gutterBottom variant="body1" component="h2">
        Select one record to see the details.
      </Typography>
    </div>
  );
};

export default ExchangeDetails;
