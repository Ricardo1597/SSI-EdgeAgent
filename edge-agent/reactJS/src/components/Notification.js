import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import config from '../config';
import ReactNotifications from 'react-notifications-component';
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Grid from '@material-ui/core/Grid';
import { connect } from 'react-redux';

let socket;

function Notifications({ connections, updateConnection }) {
  useEffect(() => {
    socket = io(config.agentEndpoint);
    return () => {
      socket.emit('disconnect');
      socket.off();
    };
  }, [config.agentEndpoint]);

  useEffect(() => {
    socket.on('notification', (notification) => {
      console.log('Notification received: ');
      console.log(notification);

      // Show notification on screen
      showNotification(notification);

      console.log(notification.record);

      switch (notification.protocol) {
        case 'connection':
          // If it is a connection notification, update connection record
          updateConnection(notification.record);
          break;
        default:
          break;
      }
    });
  }, []);

  const showNotification = (notification) => {
    store.addNotification({
      content: MyNotification(notification), // 'default', 'success', 'info', 'warning'
      container: 'top-right', // where to position the notifications
      insert: 'top',
      animationIn: ['animated', 'fadeIn'], // animate.css classes that's applied
      animationOut: ['animated', 'fadeOut'], // animate.css classes that's applied
      dismiss: {
        duration: 5000,
        click: true,
        showIcon: true,
      },
      width: 420,
    });
  };

  const MyNotification = (notification) => {
    return (
      <Grid
        container
        style={styles.notification}
        alignItems="center"
        onClick={() => notificationRedirect()}
      >
        <Grid xs={2}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <NotificationsIcon fontSize="large" />
          </div>
        </Grid>
        <Grid item xs={10}>
          <div style={styles.notificationBody}>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>
              {notification ? notification.protocol : 'Title'}
            </div>
            {notification
              ? notification.type
              : 'Just a message created to test how a very large message affects the notification'}
          </div>
        </Grid>
      </Grid>
    );
  };

  const notificationRedirect = () => {
    alert('redirect not available yet.');
  };

  return (
    <div style={styles.notifications}>
      <ReactNotifications />
      {/* <button
          onClick={() => {
            store.addNotification({
              content: MyNotification(),               // 'default', 'success', 'info', 'warning'
              container: 'top-right',                  // where to position the notifications
              insert: 'top',
              animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
              animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
              dismiss: {
                duration: 50000,
                click: false,
                showIcon: true
              },
              width: 420
            })
          }}
        >
          Add notification
        </button> */}
    </div>
  );
}

// Styles
const styles = {
  notification: {
    borderRadius: 5,
    backgroundColor: 'white',
    opacity: '80%',
  },
  notificationBody: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 10,
  },
  notifications: {
    marginLeft: '-100px',
  },
};

const mapStateToProps = (state) => {
  return {
    connections: state.connections,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateConnection: (connection) => {
      dispatch({ type: 'UPDATE_CONNECTION', connection: connection });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
