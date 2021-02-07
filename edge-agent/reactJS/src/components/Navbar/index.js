import React, { useState, useEffect } from 'react';
import { Link, withRouter, useLocation } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';

import '../../App.css';
import './styles.css';
import 'font-awesome/css/font-awesome.min.css';
import axios from 'axios';

import Navbar from 'react-bootstrap/Navbar';
import config from '../../config';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { faAddressBook } from '@fortawesome/free-solid-svg-icons';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import HomeIcon from '@material-ui/icons/Home';
import GavelIcon from '@material-ui/icons/Gavel';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import styled from 'styled-components';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { updateToken } from '../../redux/actions/auth';
import { getToken } from '../../redux/selectors';

const MyLink = styled(Link)`
  text-align: center;
  text-decoration: none;
  color: white;
`;

const MyItemDiv = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const IconDiv = styled.div`
  flex-grow: 1;
  text-align: right;
`;

const MyLinkWithPadding = styled(Link)`
  text-align: center !important;
  text-decoration: none !important;
  color: white !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
`;

const rightIcon = () => {
  return (
    <IconDiv>
      <ArrowForwardIosIcon style={{ fontSize: 15 }} />
    </IconDiv>
  );
};

function MyNavbar(props) {
  const dispatch = useDispatch();
  const location = useLocation();
  const urlPath = location.pathname;

  const accessToken = useSelector(getToken);

  const logout = () => {
    axios
      .post(
        `${config.endpoint}/users/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .then((res) => {
        localStorage.clear();
        dispatch(updateToken(''));
        props.history.push('/login');
      })
      .catch((err) => {
        console.log('Error logging out');
      });
  };

  const getDIDPermissions = () => {
    const dids = JSON.parse(localStorage.getItem('dids'));
    return dids &&
      dids.filter((did) => did.role !== null && did.role !== 'no role' && did.role !== '201')
        .length > 0
      ? true
      : false;
  };

  console.log(urlPath);
  console.log('AccessToken: ', accessToken);

  return (
    <>
      <Menu pageWrapId={'pageContent'} outerContainerId={'pageContent'}>
        <Link
          id="home"
          className="menu-item"
          to="/home"
          style={{ color: urlPath.match('^/home(/*)?') ? '#0a22bb' : 'inherit' }}
        >
          <MyItemDiv>
            <HomeIcon
              style={{
                fontSize: 25,
                marginLeft: -3,
                marginRight: 15,
              }}
            />
            Dashboard
          </MyItemDiv>
        </Link>
        <Link
          id="wallet"
          to="/wallet"
          style={{
            color: urlPath.match('^/wallet(/*)?') ? '#0a22bb' : 'inherit',
          }}
        >
          <MyItemDiv>
            <FontAwesomeIcon icon={faWallet} style={{ fontSize: 18, marginRight: 20 }} />
            My Wallet
            {rightIcon()}
          </MyItemDiv>
        </Link>
        <Link
          id="connections"
          to="/connections"
          style={{ color: urlPath.match('^/connections(/*)?') ? '#0a22bb' : 'inherit' }}
        >
          <MyItemDiv>
            <FontAwesomeIcon icon={faAddressBook} style={{ fontSize: 20, marginRight: 20 }} />
            My Connections
            {rightIcon()}
          </MyItemDiv>
        </Link>
        <Link
          id="exchanges"
          to="/exchanges"
          style={{ color: urlPath.match('^/exchanges(/*)?') ? '#0a22bb' : 'inherit' }}
        >
          <MyItemDiv>
            <FontAwesomeIcon
              icon={faExchangeAlt}
              style={{
                fontSize: 20,
                marginLeft: -1,
                marginRight: 19,
              }}
            />
            My Exchanges
            {rightIcon()}
          </MyItemDiv>
        </Link>
        <Link
          id="ledger"
          to="/ledger"
          style={{ color: urlPath.match('^/ledger(/*)?') ? '#0a22bb' : 'inherit' }}
        >
          <MyItemDiv>
            <GavelIcon style={{ fontSize: 22, marginLeft: -2, marginRight: 19 }} />
            Public Registry
          </MyItemDiv>
        </Link>
      </Menu>
      <Navbar style={styles.navStyle} bg="black">
        <div style={styles.navHome}>
          <MyLinkWithPadding to="/home">
            <strong>SelfSov</strong>
          </MyLinkWithPadding>
        </div>
        <div style={styles.logout}>
          <MyLink to="/" onClick={() => logout()}>
            <p style={{ color: '#212529' }}>Logout</p>
          </MyLink>
        </div>
        <MoreVertIcon className="mx-3" />
        <AccountCircleIcon className="mr-3" fontSize="large" />
      </Navbar>
    </>
  );
}

const styles = {
  navStyle: {
    fontSize: 16,
    height: 55,
    letterSpacing: 0.4,
  },
  navHome: {
    marginRight: 30,
    marginLeft: 65,
    fontSize: 22,
    textDecoration: 'none',
    color: 'white',
  },
  logout: {
    marginLeft: 'auto',
    marginRight: 40,
    textDecoration: 'none',
    color: 'white',
  },
  selectedTab: {
    fontWeight: 'bold',
  },
};

export default withRouter(MyNavbar);
