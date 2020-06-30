import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import '../App.css'
import axios from 'axios'

import Navbar from 'react-bootstrap/Navbar'
import config from '../config'
import { Nav } from 'react-bootstrap'
import { connect } from 'react-redux';


class MyNavbar extends React.Component {

  logout = () => {
    const jwt = this.props.accessToken;

    axios.post(`${config.endpoint}/users/logout`, {}, {
      headers: { Authorization: `Bearer ${jwt}`} 
    })
    .then( res => {
      localStorage.clear();
      this.props.updateAccessToken("");
      this.props.history.push('/login')
    })
    .catch(err => {
      console.log('Error logging out')
    })
    
  }

  getDIDPermissions = () => {
    const dids = JSON.parse(localStorage.getItem('dids'));
    return (dids && dids.filter(did => (did.role !== null) && (did.role !== "no role")).length > 0) ? true : false
  }


  render() {  
    const permission = this.getDIDPermissions();
    
    // Validate token in the server
    return( (this.props.accessToken === "") ? '' :
      <Navbar style={styles.navStyle} bg="dark" variant="dark">
        <Link style={styles.navHome} to="/">SelfSov</Link>
        <Nav className="mr-auto">
          <Link to="/connections" style={{...styles.navLinkMargins, ...styles.navLinkStyle}}>Connections</Link>
          <Link to="/credentials" style={{...styles.navLinkMargins, ...styles.navLinkStyle}}>Credentials</Link>
          <Link to="/presentations" style={{...styles.navLinkMargins, ...styles.navLinkStyle}}>Presentations</Link>
          <Link to="/nyms" style={{...styles.navLinkMargins, ...styles.navLinkStyle}}>Nyms</Link>
          <Link to="/schemas" style={{...styles.navLinkMargins, ...styles.navLinkStyle}}>Schemas</Link>
          { permission 
            ? <Link to="/revocations" style={{...styles.navLinkMargins, ...styles.navLinkStyle}}>Revocations</Link>
            : null 
          }
        </Nav>
        <Nav style={styles.logout}>
          <Link to="/" style={styles.navLinkStyle} onClick={this.logout}>Logout</Link>
        </Nav>
      </Navbar>
    );
  }
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
    color: 'white'
  },
  navLinkMargins: {
    marginRight: 25,
    marginLeft: 25
  },
  navLinkStyle: {
    textDecoration: 'none',
    color: 'white'
  },
  logout: {
    marginLeft: 'auto',
    marginRight: 40,
    textDecoration: 'none',
    color: 'white'
  }
}



const mapStateToProps = (state) => {
  return {
      accessToken: state.accessToken
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateAccessToken: (token) =>  { dispatch({type: 'UPDATE_ACCESSTOKEN', token: token}) },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MyNavbar))