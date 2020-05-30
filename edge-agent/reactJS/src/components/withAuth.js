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
      if(!jwt) {
        this.setState({ loading: false, redirect: true });
      } else {
        axios.get(`${config.endpoint}/users/checkToken`, { 
          headers: { Authorization: `Bearer ${jwt}`}
        })
        .then(res => {
          if (res.status === 200) {
            this.setState({ loading: false });
          } 
        })
        .catch(err => {
          console.error("aqui 2: ", err);
          this.setState({ loading: false, redirect: true });
          updateAccessToken("");
        });
      }
    }
    
    render() {

      const { loading, redirect } = this.state;
      if (loading) {
        return null;
      }
      if (redirect) {
        return <Redirect to="/login" />;
      }
      return <ComponentToProtect {...this.props} {...rest}/>;
    }
  }
}


export default withAuth