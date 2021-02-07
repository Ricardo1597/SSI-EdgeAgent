import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
import { Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import { withSnackbar } from 'notistack';

import axios from 'axios';
import config from '../../config';

import '../../styles.css';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../../redux/selectors';
import { setConnections } from '../../redux/actions/connections';
import { updateToken } from '../../redux/actions/auth';

const SignIn = ({ enqueueSnackbar, closeSnackbar, classes }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);

  const accessToken = useSelector(getToken);

  useEffect(() => {
    if (
      accessToken !== '' &&
      Cookies.get('refreshToken' + process.env.REACT_APP_SERVER_PORT) !== ''
    ) {
      axios
        .get(`${config.endpoint}/users/check-token`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => {
          setRedirect(true);
        })
        .catch((err) => {
          dispatch(updateToken(''));
        });
    }

    setLoading(false);
  }, [accessToken]);

  const showSnackbarVariant = (message, variant) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: (key) => (
        <>
          <Button
            style={{ color: 'white' }}
            onClick={() => {
              closeSnackbar(key);
            }}
          >
            <strong>Dismiss</strong>
          </Button>
        </>
      ),
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        `${config.endpoint}/users/login`,
        {
          username: username,
          password: password,
        },
        {
          withCredentials: true,
        }
      )
      .then(({ data: { accessToken, connections, dids } }) => {
        dispatch(updateToken(accessToken));
        dispatch(setConnections(connections));
        localStorage.setItem('dids', JSON.stringify(dids));
        history.push('/');
      })
      .catch((err) => {
        console.log(err);
        if (err.status === 401) {
          setInvalidCredentials(true);
        } else {
          showSnackbarVariant('Error signing in. Please try again.', 'error');
        }
      });
  };

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
          <form className={classes.form} noValidate onSubmit={onSubmit}>
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {invalidCredentials && <div className="login-feedback">Invalid credentials</div>}
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
};

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

export default withStyles(useStyles)(withSnackbar(SignIn));
