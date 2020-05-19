import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import '../App.css'
import axios from 'axios'

import Navbar from 'react-bootstrap/Navbar'
import { Nav } from 'react-bootstrap'

class MyNavbar extends React.Component {


  logout() {

    const jwt = localStorage.getItem('my-jwt')

    axios.post('/users/logout', { headers: { Authorization: `Bearer ${jwt}`} })
    .then( e => {
      localStorage.clear();
      this.props.history.push('/login')
    })
    .catch(err => {
      console.log('erro no logout')
    })
    
  }

  showSchemaOps() {
    return (JSON.parse(localStorage.getItem('dids')).filter(did => (did.role !== null) && (did.role !== "no role")).length > 0) ? true : false
  }


  render() {    
    return( (localStorage.getItem('my-jwt') === null) ? '' :
      <Navbar style={styles.navStyle} bg="dark" variant="dark">
        <Navbar.Brand style={styles.navHome} href="/dashboard">SelfSov</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link style={styles.navLinkStyle} href="/credentials">Credentials</Nav.Link>
          <Nav.Link style={styles.navLinkStyle} href="/relationships">Relationships</Nav.Link>
          <Nav.Link style={styles.navLinkStyle} href="/getSchema">Get Schema</Nav.Link>
          { (this.showSchemaOps()) ? (
            <Nav.Link style={styles.navLinkStyle} href="/createSchema">Create Schema</Nav.Link>
          ) : null
          }
          { (this.showSchemaOps()) ? (
            <Nav.Link style={styles.navLinkStyle} href="/nyms">Nyms</Nav.Link>
          ) : null
          }
        </Nav>
        <Nav style={styles.logout}>
          <Nav.Link onClick={() => {this.logout()}}>Logout</Nav.Link>
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
    marginLeft: 20
  },
  navLinkStyle: {
    marginRight: 20,
    marginLeft: 20
  },
  logout: {
    marginLeft: 'auto',
    marginRight: 40
  }
}


export default withRouter(MyNavbar) 