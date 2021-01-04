import React, { Component, Fragment } from 'react';
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
import Paper from '@material-ui/core/Paper';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../config';

import '../../styles.css';

class SignUp extends Component {
  state = {
    name: '',
    username: '',
    password1: '',
    password2: '',
    loading: true,
    redirect: false,
    invalidCredentials: false,
    formErrors: {
      name: '',
      username: '',
      password1: '',
      password2: '',
    },
  };

  showSnackbarVariant = (message, variant) => {
    this.props.enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: this.action,
    });
  };

  action = (key) => (
    <Fragment>
      <Button
        style={{ color: 'white' }}
        onClick={() => {
          this.props.closeSnackbar(key);
        }}
      >
        <strong>Dismiss</strong>
      </Button>
    </Fragment>
  );

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      invalidCredentials: false,
    });
  };

  isFormValid = () => {
    let valid = true;
    Object.values(this.state.formErrors).forEach((val) => {
      val.length && (valid = false);
    });

    return valid;
  };

  handleValidation = (e) => {
    const { name, value } = e.target;
    let errors = this.state.formErrors;
    // clean previous error
    errors[name] = '';

    switch (name) {
      case 'name':
        if (value.length === 0) {
          errors.name = 'Required';
        } else if (!value.match(/^[a-zA-Z0-9\-_ ]+$/)) {
          errors.name = 'Invalid characters';
        }
        break;
      case 'username':
        if (value.length === 0) {
          errors.username = 'Required';
        } else if (!value.match(/^[a-zA-Z0-9\-_]+$/)) {
          errors.username = 'Invalid characters';
        }
        break;
      case 'password1':
      case 'password2':
        if (value.length === 0) {
          errors[name] = 'Required';
        } else if (value.length < 6) {
          errors[name] = 'Must be at least 6 characters long';
        } else if (!/(?=.*[0-9])/.test(value)) {
          errors[name] = 'Must contain a number';
        }
        break;
      default:
        break;
    }

    this.setState({ formErrors: errors });
  };

  componentDidMount() {
    const jwt = this.props.accessToken;
    if (jwt !== '' && Cookies.get('refreshToken' + process.env.REACT_APP_SERVER_PORT) !== '') {
      axios
        .get(`${config.endpoint}/users/check-token`, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        .then((res) => {
          this.setState({ redirect: true });
        })
        .catch((err) => {
          this.props.updateAccessToken('');
        });
    }

    this.setState({ loading: false });
  }

  onSubmit = (e) => {
    e.preventDefault();

    //check if all fields are valid
    if (!this.isFormValid()) {
      return;
    }

    axios
      .post(`${config.endpoint}/users/register`, {
        name: this.state.name,
        username: this.state.username,
        password1: this.state.password1,
        password2: this.state.password2,
      })
      .then((res) => {
        console.log(res);
        this.props.history.push('/login');
      })
      .catch((err) => {
        console.log(err);
        if (err.status === 401) {
          this.setState({ invalidCredentials: true });
        } else {
          this.showSnackbarVariant('Error signing up. Please try again.', 'error');
        }
      });
  };

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
          <Grid item component={Paper} elevation={6} square>
            <div className={classes.paper}>
              <Avatar className={classes.avatar}></Avatar>
              <Typography component="span" variant="h5">
                Sign up
              </Typography>
              <form className={classes.form} noValidate onSubmit={this.onSubmit}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Name"
                  name="name"
                  autoComplete="name"
                  value={this.state.name}
                  onChange={(e) => {
                    this.handleChange(e);
                    this.handleValidation(e);
                  }}
                  error={this.state.formErrors.name !== ''}
                  helperText={this.state.formErrors.name}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={this.state.username}
                  onChange={(e) => {
                    this.handleChange(e);
                    this.handleValidation(e);
                  }}
                  error={this.state.formErrors.username !== ''}
                  helperText={this.state.formErrors.username}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password1"
                  label="Password"
                  type="password"
                  id="password1"
                  autoComplete="current-password"
                  value={this.state.password1}
                  onChange={(e) => {
                    this.handleChange(e);
                    this.handleValidation(e);
                  }}
                  error={this.state.formErrors.password1 !== ''}
                  helperText={this.state.formErrors.password1}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password2"
                  label="Confirm password"
                  type="password"
                  id="password2"
                  autoComplete="current-password"
                  value={this.state.password2}
                  onChange={(e) => {
                    this.handleChange(e);
                    this.handleValidation(e);
                  }}
                  error={this.state.formErrors.password2 !== ''}
                  helperText={this.state.formErrors.password2}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  Sign Up
                </Button>
                {this.state.invalidCredentials && (
                  <div className="login-feedback">Invalid credentials</div>
                )}
                <Grid container justify="flex-end">
                  <Grid item>
                    <Link href="/login" variant="body2">
                      Already have an account? Sign in
                    </Link>
                  </Grid>
                </Grid>
              </form>
            </div>
          </Grid>
        </Container>
      </Grid>
    );
  }
}

const useStyles = (theme) => ({
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
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateAccessToken: (token) => {
      dispatch({ type: 'UPDATE_ACCESSTOKEN', token: token });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(useStyles)(withSnackbar(SignUp)));
