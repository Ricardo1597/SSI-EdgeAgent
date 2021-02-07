import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import config from '../config';
import axios from 'axios';

export default function withAuth(ComponentToProtect, accessToken, updateAccessToken, ...rest) {
  return class extends Component {
    constructor() {
      super();
      this.state = {
        redirect: false,
      };
    }

    componentDidMount() {
      this.setState({ loading: true });
      axios
        .get(`${config.endpoint}/users/check-token`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => {
          // Do nothing
        })
        .catch((err) => {
          console.error('error in withAuth: ', err);
          this.setState({ redirect: true });
          updateAccessToken('');
        });
    }

    render() {
      const { redirect } = this.state;

      if (redirect) {
        return <Redirect to="/login" />;
      }
      return <ComponentToProtect {...this.props} {...rest} />;
    }
  };
}
