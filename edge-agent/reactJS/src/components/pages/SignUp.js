import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import axios from 'axios';
import config from '../../config'


export default function SignUp(props) {
  const classes = useStyles();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    axios.post(`${config.endpoint}/users/register`, {
      name,
      username,
      password,
      password2
    })
    .then(res => {
        console.log(res)
      if (res.status === 200) {
        props.history.push('/login');
      } else {
        const error = new Error(res.error);
        throw error;
      }
    })
    .catch(err => {
        console.error(err);
        alert('Error signing up. Please try again.');
    });
  }

  return (
    <Grid container component="main" minWidth='100vw' className={classes.root}>
      <CssBaseline />
      <Container maxWidth="xs">
        <div className={classes.paper} >
            <Avatar className={classes.avatar}>
            </Avatar>
            <Typography component="h1" variant="h5">
            Sign up
            </Typography>
            <form className={classes.form} noValidate onSubmit={onSubmit}>
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
                    value={name}
                    onChange={e => setName(e.target.value)}
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
                    value={username}
                    onChange={e => setUsername(e.target.value)}
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
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="password"
                    label="Confirm password"
                    type="password"
                    id="password2"
                    autoComplete="current-password"
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
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


const useStyles = makeStyles((theme) => ({
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
  }));


