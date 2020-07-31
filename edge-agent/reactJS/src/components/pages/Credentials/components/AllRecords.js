import React, { Component, Fragment } from 'react';

import axios from 'axios';
import config from '../../../../config';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { withSnackbar } from 'notistack';

import RecordSummary from '../../../RecordSummary';
import RecordDetails from '../../../RecordDetails';
import RecordActions from './RecordActions';

import { connect } from 'react-redux';

class AllRecords extends Component {
  state = {
    exchanges: [],
    exchange: null,
  };

  showSnackbarVariant = (message, variant) => {
    this.props.enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: this.action,
    });
  };

  action = (key) => (
    <Fragment>
      <Button
        style={{ color: 'white' }}
        onClick={() => {
          this.props.closeSnackbar(key);
        }}
      >
        <strong>Dismiss</strong>
      </Button>
    </Fragment>
  );

  changeCredExchange = (id) => {
    const exchange = this.state.exchanges.find((exchange) => {
      return exchange.credentialExchangeId === id;
    });
    this.setState({ exchange: exchange });
  };

  deleteRecord = (id) => {
    const jwt = this.props.accessToken;

    axios
      .delete(`${config.endpoint}/api/credential-exchanges/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        console.log(res.data.id);
        this.showSnackbarVariant('Credential exchange record deleted.', 'success');
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant(
          'Error deleting credential exchange record. Please try again.',
          'error'
        );
      });
  };

  // Set state with props on page refresh
  componentWillReceiveProps(props) {
    props.recordId
      ? this.setState({
          exchange: this.state.exchanges.find((exchange) => {
            return exchange.credentialExchangeId === props.recordId;
          }),
        })
      : this.setState({ exchange: this.state.exchanges[0] });
  }

  componentWillMount() {
    const jwt = this.props.accessToken;

    axios
      .get(`${config.endpoint}/api/credential-exchanges`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        console.log(res.data);
        this.setState({
          exchanges: res.data.records || [],
        });
        this.props.recordId
          ? this.changeCredExchange(this.props.recordId)
          : res.data.records && res.data.records.length
          ? this.setState({ exchange: res.data.records[0] })
          : this.setState({ exchange: null });
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant(
          'Error getting credentials exchanges records. Please try again.',
          'error'
        );
      });
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={`${classes.root}`}>
        <Grid container>
          <Grid item className={classes.card}>
            <Container
              className="scrollBar"
              style={{ height: '85vh', overflowY: 'scroll' }}
              maxWidth="xs"
            >
              {this.state.exchanges.length
                ? this.state.exchanges
                    .filter((exchange) => {
                      return exchange.state !== 'mudar para done';
                    })
                    .map((exchange) => (
                      <Grid
                        item
                        xs={12}
                        key={exchange.credentialExchangeId}
                        onClick={this.changeCredExchange.bind(this, exchange.credentialExchangeId)}
                      >
                        <RecordSummary
                          record={{
                            id: exchange.credentialExchangeId,
                            createdAt: exchange.createdAt,
                            updatedAt: exchange.updatedAt,
                            // other attributes
                          }}
                          selected={
                            this.state.exchange &&
                            exchange.credentialExchangeId ===
                              this.state.exchange.credentialExchangeId
                          }
                        />
                      </Grid>
                    ))
                : null}
            </Container>
          </Grid>
          <Grid item className={classes.details}>
            {this.state.exchange ? (
              <Card>
                <RecordDetails
                  record={{
                    recordId: this.state.exchange.credentialExchangeId,
                    initiator: this.state.exchange.initiator,
                    role: this.state.exchange.role,
                    state: this.state.exchange.state,
                    threadId: this.state.exchange.threadId,
                    connectionId: this.state.exchange.connectionId,
                    proposal: this.state.exchange.credentialProposalDict,
                    error: this.state.exchange.error,
                  }}
                />
                <CardActions>
                  <RecordActions
                    id={this.state.exchange.credentialExchangeId}
                    state={this.state.exchange.state}
                    role={this.state.exchange.role}
                  />
                  <Button
                    size="small"
                    color="primary"
                    onClick={this.deleteRecord.bind(this, this.state.exchange.credentialExchangeId)}
                  >
                    Remove Record
                  </Button>
                </CardActions>
              </Card>
            ) : (
              <div align="center">
                <Typography gutterBottom variant="body1" component="h2">
                  Select one record to see the details.
                </Typography>
              </div>
            )}
          </Grid>
        </Grid>
      </div>
    );
  }
}

// Styles
const useStyles = (theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    height: '100%',
  },
  'root::-webkit-scrollbar': {
    width: 50,
  },
  card: {
    width: 430,
  },
  details: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    flexGrow: 1,
    backgroundColor: '#F6F6F6',
    minWidth: 500,
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(AllRecords)));
