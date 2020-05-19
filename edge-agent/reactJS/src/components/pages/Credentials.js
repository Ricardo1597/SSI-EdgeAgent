import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CredentialItem from '../CredentialItem';

class Credentials extends Component{

  render() {
    const { credentials } = this.props[0]

    return credentials.map((credential) => (
      <div key={credential.id}>
        <CredentialItem credential={credential}/>
      </div>
     ));
  }
}


export default Credentials;
