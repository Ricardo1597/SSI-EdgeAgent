import React, { Component, Fragment } from 'react';

import axios from 'axios';
import config from '../../../../config';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';

import ConnectionItem from './ConnectionItem';
import ConnectionDetails from './ConnectionDetails';
import { withSnackbar } from 'notistack';

import { connect } from 'react-redux';

class ActiveConnections extends Component {
  state = {
    connection: null,
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

  changeConnection = (id) => {
    const connection = this.props.connections.find((connection) => {
      return connection.connectionId === id;
    });
    if (connection != null) this.setState({ connection: connection });
  };

  // Set state with props on page refresh
  componentWillReceiveProps(props) {
    props.connectionId
      ? this.setState({
          connection: props.connections.find((connection) => {
            return connection.connectionId === props.connectionId;
          }),
        })
      : this.setState({ connection: props.connections[0] });
  }

  // Set state with props on tab change
  componentWillMount() {
    this.props.connectionId
      ? this.changeConnection(this.props.connectionId)
      : this.setState({ connection: this.props.connections[0] });
  }

  proposeCredRedirect = (id) => {
    this.props.history.push('/credentials?tab=2&connectionId=' + id);
  };

  offerCredRedirect = (id) => {
    this.props.history.push('/credentials?tab=3&connectionId=' + id);
  };

  proposePresRedirect = (id) => {
    this.props.history.push('/presentations?tab=1&connectionId=' + id);
  };

  requestPresRedirect = (id) => {
    this.props.history.push('/presentations?tab=2&connectionId=' + id);
  };

  deleteConnection = (id) => {
    const jwt = this.props.accessToken;

    axios
      .delete(`${config.endpoint}/api/connections/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then(({ data: { id } }) => {
        console.log(id);
        this.props.removeConnection(id);
        this.showSnackbarVariant('Connection deleted.', 'success');
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error deleting connection. Please try again.', 'error');
      });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={`${classes.root}`}>
        <Grid container>
          <Grid item className={classes.card}>
            <Container
              className="scrollBar p-0 m-0"
              style={{ height: '85vh', overflowY: 'scroll' }}
              maxWidth="xs"
            >
              {this.props.connections
                ? this.props.connections.map((connection) => (
                    <Grid
                      item
                      xs={12}
                      key={connection.connectionId}
                      onClick={this.changeConnection.bind(this, connection.connectionId)}
                    >
                      {this.state.connection &&
                      connection.connectionId === this.state.connection.connectionId ? (
                        <ConnectionItem connection={connection} selected={true} />
                      ) : (
                        <ConnectionItem connection={connection} selected={false} />
                      )}
                    </Grid>
                  ))
                : null}
            </Container>
          </Grid>
          <Grid item className={classes.details}>
            {this.state.connection ? (
              <Card>
                <ConnectionDetails connection={this.state.connection} />
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => this.proposeCredRedirect(this.state.connection.connectionId)}
                  >
                    Propose credential
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => this.offerCredRedirect(this.state.connection.connectionId)}
                  >
                    Offer credential
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => this.proposePresRedirect(this.state.connection.connectionId)}
                  >
                    Propose Presentation
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => this.requestPresRedirect(this.state.connection.connectionId)}
                  >
                    Request Presentation
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={this.deleteConnection.bind(this, this.state.connection.connectionId)}
                  >
                    Remove Connection
                  </Button>
                </CardActions>
              </Card>
            ) : null}
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
  card: {
    width: 380,
  },
  details: {
    marginLeft: 30,
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

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(ActiveConnections)));
