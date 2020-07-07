import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Switch, 
  Route, 
  //Redirect 
} from 'react-router-dom';



// Components
import Nav from './components/MyNavbar'
import Credentials from './components/pages/Credentials'
import Presentations from './components/pages/Presentations'
import Dashboard from './components/pages/Dashboard'
import Connections from './components/pages/Connections';
import Login from './components/pages/SignIn';
import Register from './components/pages/SignUp';
import Ledger from './components/pages/Ledger';
import Revocations from './components/pages/Revocations';
import withAuth from './components/withAuth'
import { connect } from 'react-redux';

import Notifications from './components/Notification';


function App(props) {
  const protectRoute = (component) => {
    return withAuth(component, props.accessToken, props.updateAccessToken)
  }

  return (
    <div>
      <Router>
        <Nav/>
        <Notifications/>
        <Switch>
          <Route exact path="/" component={protectRoute(Dashboard)}/>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/register" component={Register}/>
          <Route exact path="/credentials" component={protectRoute(Credentials)}/>
          <Route exact path="/presentations" component={protectRoute(Presentations)}/>
          <Route exact path="/connections" component={protectRoute(Connections)}/>
          <Route exact path="/ledger" component={protectRoute(Ledger)}/>
          <Route exact path="/revocations" component={protectRoute(Revocations)}/>
        </Switch>
      </Router>
    </div>
  );
}

// Styles
const styles = ({
  
});

const mapDispatchToProps = (dispatch) => {
  return {
    updateAccessToken: (token) =>  { dispatch({type: 'UPDATE_ACCESSTOKEN', token: token}) },
  }
}

const mapStateToProps = (state) => {
  return {
      accessToken: state.accessToken
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
