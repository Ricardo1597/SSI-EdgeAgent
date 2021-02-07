import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Components
import Nav from './components/Navbar';
import Dashboard from './components/pages/Dashboard';
import Login from './components/pages/SignIn';
import Register from './components/pages/SignUp';
import Ledger from './components/pages/Ledger';

import Exchanges from './components/pages/Exchanges';
import MyConnections from './components/pages/MyConnections';
import MyWallet from './components/pages/MyWallet';
import NotFound from './components/pages/NotFound/index';

import withAuth from './components/withAuth';

import './App.css';

import Notifications from './components/Notification';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { updateToken } from './redux/actions/auth';
import { getToken } from './redux/selectors';

function App() {
  const dispatch = useDispatch();

  const accessToken = useSelector(getToken);

  const updateAccessToken = (token) => {
    dispatch(updateToken(token));
  };

  const protectRoute = (component) => {
    return withAuth(component, accessToken, updateAccessToken);
  };

  const withNav = (MyComponent) => {
    return class extends Component {
      render() {
        return (
          <>
            <Nav />
            <MyComponent {...this.props} />
          </>
        );
      }
    };
  };

  return (
    <div>
      <Router>
        <Notifications />

        <div id="pageContent">
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/" component={protectRoute(withNav(Dashboard))} />
            <Route exact path="/home" component={protectRoute(withNav(Dashboard))} />
            <Route
              exact
              path="/exchanges(/[a-zA-Z0-9\-]*)?"
              component={protectRoute(withNav(Exchanges))}
            />
            <Route
              exact
              path="/connections(/[a-zA-Z0-9\-]*)?"
              component={protectRoute(withNav(MyConnections))}
            />
            <Route
              exact
              path="/wallet(/[a-zA-Z0-9\-]*)?"
              component={protectRoute(withNav(MyWallet))}
            />
            <Route exact path="/ledger" component={protectRoute(withNav(Ledger))} />
            <Route path="*" component={NotFound} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
