import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Axios from 'axios';


export default function withAuth(ComponentToProtect, ...rest) {

  return class extends Component {
    constructor() {
      super();
      this.state = {
        loading: true,
        redirect: false,
      };
    }


    componentDidMount() {

      const jwt = localStorage.getItem('my-jwt')
      if(!jwt) {
        this.setState({ loading: false, redirect: true });
      } else {
        Axios.get('users/checkToken', { headers: { Authorization: `Bearer ${jwt}`}})
        .then(res => {
          if (res.status === 200) {
            this.setState({ loading: false });
          } else {
            const error = new Error(res.error);
            throw error;
          }
        })
        .catch(err => {
          console.error(err);
          this.setState({ loading: false, redirect: true });
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