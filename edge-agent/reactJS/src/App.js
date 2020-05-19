import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


// Components
import Nav from './components/MyNavbar'
import Credentials from './components/pages/Credentials'
import Nyms from './components/pages/Nyms'
import CreateSchemas from './components/pages/CreateSchema'
import GetSchemas from './components/pages/GetSchema'
import Dashboard from './components/pages/Dashboard'
import Relationships from './components/pages/Relationships';
import Login from './components/pages/SignIn';
import Register from './components/pages/SignUp';

import withAuth from './components/withAuth'


class App extends Component {
  state = {
    credentials: [
      {
        id: 1,
        name: 'car_license',
        issuer: 'IMT',
        validity: new Date(2020, 10, 4)
      },
      {
        id: 2,
        name: 'id_card',
        issuer: 'government',
        validity: new Date(2024, 7, 25)
      },
      {
        id: 3,
        name: 'job_card',
        issuer: 'xpto',
        validity: new Date(2020, 3, 22)
      },
      {
        id: 4,
        name: 'car_license',
        issuer: 'IMT',
        validity: new Date(2020, 10, 4)
      },
      {
        id: 5,
        name: 'id_card',
        issuer: 'government',
        validity: new Date(2024, 7, 25)
      },
      {
        id: 6,
        name: 'job_card',
        issuer: 'xpto',
        validity: new Date(2020, 3, 22)
      }
    ],
    isOpen: false
  }

  toggleCollapse = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }
  
  render() {
    
    return (
      <div>
        <Router>
          <Nav/>
          <Switch>
            <Route path="/" exact component={Login}/>
            <Route path="/login" exact component={Login}/>
            <Route path="/register" exact component={Register}/>
            <Route path="/dashboard" exact component={withAuth(Dashboard)}/>
            <Route path="/credentials" component={withAuth(Credentials, {credentials: this.state.credentials})}/>
            <Route path="/relationships" exact component={withAuth(Relationships)}/>
            <Route path="/createSchema" exact component={withAuth(CreateSchemas)}/>
            <Route path="/getSchema" exact component={withAuth(GetSchemas)}/>
            <Route path="/nyms" exact component={withAuth(Nyms)}/>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
