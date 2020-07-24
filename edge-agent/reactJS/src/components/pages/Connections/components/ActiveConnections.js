import React, { Component } from 'react';

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
import ActiveConnectionActions from './ActiveConnectionActions';

import { connect } from 'react-redux';

class ActiveConnections extends Component {
  state = {
    connection: null,
  };

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

  deleteConnection = (id) => {
    const jwt = this.props.accessToken;

    axios
      .delete(`${config.endpoint}/api/connections/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then(({ data: { id } }) => {
        console.log(id);
        this.props.removeConnection(id);
      })
      .catch((err) => {
        console.error(err);
        alert('Error deleting connection. Please try again.');
      });
  };

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
                  <ActiveConnectionActions
                    connection={this.state.connection}
                    updateConnection={this.props.updateConnection}
                  />
                  <Button size="small" color="primary" onClick={() => {}}>
                    Propose credential
                  </Button>
                  <Button size="small" color="primary" onClick={() => {}}>
                    Offer credential
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
    accessToken: state.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(ActiveConnections));
