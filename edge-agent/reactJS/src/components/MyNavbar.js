import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import '../App.css';
import axios from 'axios';

import Navbar from 'react-bootstrap/Navbar';
import config from '../config';
import { Nav } from 'react-bootstrap';
import { connect } from 'react-redux';

function MyNavbar(props) {
  const logout = () => {
    const jwt = props.accessToken;

    axios
      .post(
        `${config.endpoint}/users/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        localStorage.clear();
        props.updateAccessToken('');
        props.history.push('/login');
      })
      .catch((err) => {
        console.log('Error logging out');
      });
  };

  const getDIDPermissions = () => {
    const dids = JSON.parse(localStorage.getItem('dids'));
    return dids && dids.filter((did) => did.role !== null && did.role !== 'no role').length > 0
      ? true
      : false;
  };

  return props.accessToken === '' ? (
    ''
  ) : (
    <Navbar style={styles.navStyle} bg="dark" variant="dark">
      <Link style={styles.navHome} to="/">
        SelfSov
      </Link>
      <Nav className="mr-auto">
        <Link to="/connections" style={{ ...styles.navLinkMargins, ...styles.navLinkStyle }}>
          Connections
        </Link>
        <Link to="/credentials" style={{ ...styles.navLinkMargins, ...styles.navLinkStyle }}>
          Credentials
        </Link>
        <Link to="/presentations" style={{ ...styles.navLinkMargins, ...styles.navLinkStyle }}>
          Presentations
        </Link>
        <Link to="/ledger" style={{ ...styles.navLinkMargins, ...styles.navLinkStyle }}>
          Ledger
        </Link>
        {getDIDPermissions() ? (
          <Link to="/revocations" style={{ ...styles.navLinkMargins, ...styles.navLinkStyle }}>
            Revocations
          </Link>
        ) : null}
      </Nav>
      <Nav style={styles.logout}>
        <Link to="/" style={styles.navLinkStyle} onClick={() => logout()}>
          Logout
        </Link>
      </Nav>
    </Navbar>
  );
}

const styles = {
  navStyle: {
    fontSize: 16,
    height: 50,
    letterSpacing: 0.4,
  },
  navHome: {
    marginTop: -2,
    marginRight: 30,
    marginLeft: 20,
    fontSize: 22,
    textDecoration: 'none',
    color: 'white',
  },
  navLinkMargins: {
    marginRight: 25,
    marginLeft: 25,
  },
  navLinkStyle: {
    textDecoration: 'none',
    color: 'white',
  },
  logout: {
    marginLeft: 'auto',
    marginRight: 40,
    textDecoration: 'none',
    color: 'white',
  },
};

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateAccessToken: (token) => {
      dispatch({ type: 'UPDATE_ACCESSTOKEN', token: token });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MyNavbar));
