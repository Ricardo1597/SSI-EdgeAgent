import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import config from '../config'
import axios from 'axios';


function withAuth(ComponentToProtect, accessToken, updateAccessToken, ...rest) {

  return class extends Component {
    constructor() {
      super();
      this.state = {
        loading: true,
        redirect: false,
      };
    }


    componentDidMount() {

      const jwt = accessToken;
      axios.get(`${config.endpoint}/users/check-token`, { 
        headers: { Authorization: `Bearer ${jwt}`}
      })
      .then(res => {
        this.setState({ loading: false });
      })
      .catch(err => {
        console.error("error in withAuth: ", err);
        this.setState({ loading: false, redirect: true });
        updateAccessToken("");
      });
    }
    
    render() {

      const { loading, redirect } = this.state;
      if (loading) {
        return "loading";
      }
      if (redirect) {
        return <Redirect to="/login" />;
      }
      return <ComponentToProtect {...this.props} {...rest}/>;
    }
  }
}


export default withAuth