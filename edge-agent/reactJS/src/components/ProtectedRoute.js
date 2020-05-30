import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import config from '../config'
import axios from 'axios';
import { connect } from 'react-redux';



function ProtectedRoute({component: Component, accessToken, updateAccessToken, ...rest}) {
    let loading = true;
    let redirect = true

    const jwt = accessToken;
    if(!jwt) {
      loading = false;
      redirect = true;
    } else {
      axios.get(`${config.endpoint}/users/checkToken`, { 
        headers: { Authorization: `Bearer ${jwt}`}
      })
      .then(res => {
        console.log("aqui1234567")
        loading = false;
      })
      .catch(err => {
        console.error("aqui 2: ", err);
        updateAccessToken("");
        loading = false;
        redirect = true;
      });
    }

    if(loading) return null;

    return (
        <Route {...rest} render={
          (props) => {
            return (
              !redirect ? (
                  <Component {...props}/>
              ) : (
                  <Redirect to="/erro" />
              )
            )
        }} />
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(ProtectedRoute)