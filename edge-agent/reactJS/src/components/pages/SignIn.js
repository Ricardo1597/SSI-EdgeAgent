import React, { Component, Fragment } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../config';

import '../../styles.css';

class SignIn extends Component {
  state = {
    username: '',
    password: '',
    loading: true,
    redirect: false,
    invalidCredentials: false,
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

    axios
      .post(
        `${config.endpoint}/users/login`,
        {
          username: this.state.username,
          password: this.state.password,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log(res.data);
        this.props.updateAccessToken(res.data.accessToken);
        this.props.updateConnections(res.data.connections);
        localStorage.setItem('dids', JSON.stringify(res.data.dids));
        this.props.history.push('/');
      })
      .catch((err) => {
        console.log(err);
        if (err.status === 401) {
          this.setState({ invalidCredentials: true });
        } else {
          this.showSnackbarVariant('Error signing in. Please try again.', 'error');
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
        <Grid item xs={false} sm={5} md={8} className={classes.image} />
        <Grid item xs={12} sm={7} md={4} component={Paper} elevation={6} square>
          <div style={{ marginTop: 200 }} className={classes.paper}>
            <Avatar className={classes.avatar}></Avatar>
            <Typography component="span" variant="h5">
              Sign in
            </Typography>
            <form className={classes.form} noValidate onSubmit={this.onSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={this.state.username}
                onChange={this.handleChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
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
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Sign In
              </Button>
              {this.state.invalidCredentials && (
                <div className="login-feedback">Invalid credentials</div>
              )}
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </form>
          </div>
        </Grid>
      </Grid>
    );
  }
}

const useStyles = (theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(http://localhost:3000/ssi-login-2.png)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  form: {
    width: '400px', // Fix IE 11 issue.
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
    updateConnections: (connections) => {
      dispatch({ type: 'INIT_CONNECTIONS', connections: connections });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(useStyles)(withSnackbar(SignIn)));
