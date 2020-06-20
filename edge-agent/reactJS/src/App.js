import React, { Component } from 'react';
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
import Nyms from './components/pages/Nyms'
import Dashboard from './components/pages/Dashboard'
import Connections from './components/pages/Connections';
import Login from './components/pages/SignIn';
import Register from './components/pages/SignUp';
import Schemas from './components/pages/Schemas';
import Revocations from './components/pages/Revocations';

import withAuth from './components/withAuth'
import axios from 'axios';
import config from './config'
import { connect } from 'react-redux';
// import ProtectedRoute from './components/ProtectedRoute';


class App extends Component {

  protectRoute = (component) => {
    return withAuth(component, this.props.accessToken, this.props.updateAccessToken)
  }

  render() {

    return (
      <div>
        <Router>
          <Nav/>
          <Switch>
            <Route exact path="/" component={this.protectRoute(Dashboard)}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/register" component={Register}/>
            <Route exact path="/credentials" component={this.protectRoute(Credentials)}/>
            <Route exact path="/presentations" component={this.protectRoute(Presentations)}/>
            <Route exact path="/connections" component={this.protectRoute(Connections)}/>
            <Route exact path="/nyms" component={this.protectRoute(Nyms)}/>
            <Route exact path="/schemas" component={this.protectRoute(Schemas)}/>
            <Route exact path="/revocations" component={this.protectRoute(Revocations)}/>
          </Switch>
        </Router>
      </div>
      // <div>
      //   <Router>
      //     <Nav/>
      //     <Switch>
      //       <ProtectedRoute exact path="/" component={Dashboard}/>
      //       <Route exact path="/login" component={Login}/>
      //       <Route exact path="/register" component={Register}/>
      //       <ProtectedRoute exact path="/credentials" component={Credentials}/>
      //       <ProtectedRoute exact path="/connections" component={Connections}/>
      //       <ProtectedRoute exact path="/createSchema" component={CreateSchemas}/>
      //       <ProtectedRoute exact path="/getSchema" component={GetSchemas}/>
      //       <ProtectedRoute exact path="/nyms" component={Nyms}/>
      //     </Switch>
      //   </Router>
      // </div>
    );
  }
}


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
