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
import Nyms from './components/pages/Nyms'
import CreateSchemas from './components/pages/CreateSchema'
import GetSchemas from './components/pages/GetSchema'
import Dashboard from './components/pages/Dashboard'
import Connections from './components/pages/Connections';
import Login from './components/pages/SignIn';
import Register from './components/pages/SignUp';

import withAuth from './components/withAuth'
import axios from 'axios';
import config from './config'
import { connect } from 'react-redux';
import ProtectedRoute from './components/ProtectedRoute';


class App extends Component {
  state = {
    loading: true
  }

  componentDidMount() {
    axios.post(`${config.endpoint}/users/refreshToken`, {}, {
      withCredentials: true,
    })
    .then(res => {
        this.props.updateAccessToken(res.data.accessToken);
        this.setState({ loading: false })
    })
    .catch(err => {
      this.props.updateAccessToken("");
      console.error(err);
      this.setState({ loading: false })
    });
  };
  
  // componentWillUnmount() {
  //   localStorage.clear() 
  // };

  protectRoute = (component) => {
    return withAuth(component, this.props.accessToken, this.props.updateAccessToken)
  }

  render() {
    if(this.state.loading) {
      return null;
    }

    // if(this.state.redirect) {       
    //   return <Redirect to="/login" />;
    // }

    return (
      <div>
        <Router>
          <Nav/>
          <Switch>
            <Route exact path="/" component={this.protectRoute(Dashboard)}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/register" component={Register}/>
            <Route exact path="/credentials" component={this.protectRoute(Credentials)}/>
            <Route exact path="/connections" component={this.protectRoute(Connections)}/>
            <Route exact path="/createSchema" component={this.protectRoute(CreateSchemas)}/>
            <Route exact path="/getSchema" component={this.protectRoute(GetSchemas)}/>
            <Route exact path="/nyms" component={this.protectRoute(Nyms)}/>
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
