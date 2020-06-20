import React, { Component } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Cookies from 'js-cookie';

import axios from 'axios';
import config from '../../config'


class SignUp extends Component {
  state = {
    name: '',
    username: '',
    password: '',
    password2: '',
    loading: true,
    redirect: false,
  }

  handleChange = e => {
      this.setState({
          [e.target.name]: e.target.value
      })
  }

  componentDidMount() {
    const jwt = this.props.accessToken;
    if(jwt !== "" && Cookies.get('refreshToken') !== "") {
      axios.get(`${config.endpoint}/users/check-token`, { 
        headers: { Authorization: `Bearer ${jwt}`}
      })
      .then(res => {
        this.setState({ redirect: true });
      })
      .catch(err => {
        this.props.updateAccessToken("");
      });
    }

    this.setState({ loading: false });
  }

  
  onSubmit = (e) => {
    e.preventDefault();
    axios.post(`${config.endpoint}/users/register`, {
      name: this.state.name,
      username: this.state.username,
      password: this.state.password,
      password2: this.state.password2,
    })
    .then(res => {
      console.log(res)
      this.props.history.push('/login');
    })
    .catch(err => {
        console.error(err);
        alert('Error signing up. Please try again.');
    });
  }


  render() {
    const { classes } = this.props;

    const { loading, redirect } = this.state;
    if (loading) {
      return null;
    }
    if (redirect) {
      return <Redirect to="/" />;
    }

    return (
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <Container maxWidth="xs">
          <div className={classes.paper} >
              <Avatar className={classes.avatar}>
              </Avatar>
              <Typography component="span" variant="h5">
              Sign up
              </Typography>
              <form className={classes.form} noValidate onSubmit={this.onSubmit}>
              <Grid container spacing={2}>
              <Grid item xs={12}>
                  <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="name"
                      label="Name"
                      name="name"
                      autoComplete="name"
                      value={this.state.name}
                      onChange={this.handleChange}
                  />
                  </Grid>            
                  <Grid item xs={12}>
                  <TextField
                      variant="outlined"
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      value={this.state.username}
                      onChange={this.handleChange}
                  />
                  </Grid>
                  <Grid item xs={12}>
                  <TextField
                      variant="outlined"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={this.state.password}
                      onChange={this.handleChange}
                  />
                  </Grid>
                  <Grid item xs={12}>
                  <TextField
                      variant="outlined"
                      required
                      fullWidth
                      name="password2"
                      label="Confirm password"
                      type="password"
                      id="password2"
                      autoComplete="current-password2"
                      value={this.state.password2}
                      onChange={this.handleChange}
                  />
                  </Grid>
              </Grid>
              <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
              >
                  Sign Up
              </Button>
              <Grid container justify="flex-end">
                  <Grid item>
                  <Link href="/login" variant="body2">
                      Already have an account? Sign in
                  </Link>
                  </Grid>
              </Grid>
              </form>
          </div>
        </Container>
      </Grid>
    );
  }
}


const useStyles = theme => ({
  root: {
    height: '100vh',
    width: '100vw !important',
    backgroundImage: 'url(http://localhost:3000/ssi-login-3.png)',
    backgroundSize: 'cover',
    overflow: 'hidden',
  },
  paper: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    padding: 30,
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {  
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});


const mapStateToProps = (state) => {
  return {
      accessToken: state.accessToken
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateAccessToken: (token) =>  { dispatch({type: 'UPDATE_ACCESSTOKEN', token: token}) },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles)(SignUp))

