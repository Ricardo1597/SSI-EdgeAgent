import { connect } from 'react-redux';


const jwtDecode = require('jwt-decode');


let accessToken = "";

export const setAccessToken = (token) => {
    console.log("Set token: ", token)
    accessToken = token;
    console.log("Set to: ", accessToken)
}

export const getAccessToken = () => {
    console.log("Access token is: ", accessToken)
    console.log("Get token")
    return accessToken;
}

export const isTokenValidOrUndefined = () => {  
    // Get access token
    const token = this.props.accessToken;

    if(!token) {
        return false;
    }

    try {
        const {exp} = jwtDecode(token);
        if (Date.now() >= exp * 1000) {
            return false;
        } else {
            return true;
        }
    } catch {
        return false;
    }
}

const mapStateToProps = (state) => {
    return {
        accessToken: state.accessToken
    }
}
  
export default connect(mapStateToProps)(isTokenValidOrUndefined)