import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import CustomPaginationTable from '../DidTable';

import axios from 'axios';
import config from '../../config';

class Dashboard extends Component {
  state = {
    seed: '',
    didAlias: '',
    dids: JSON.parse(localStorage.getItem('dids')),
    errors: [],
    width: window.innerWidth,
  };

  showSnackbarVariant = (message, variant) => {
    this.props.enqueueSnackbar(message, {
      variant,
      autoHideDuration: 5000,
      action: this.action,
    });
  };

  updateDimensions = () => {
    this.setState({ width: window.innerWidth });
  };
  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

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
    });
  };

  handleValidation = () => {
    let errors = [];
    let formIsValid = true;

    // seed: 000000000000000000000000Steward1
    if (this.state.seed.length !== 0 && this.state.seed.length !== 32) {
      formIsValid = false;
      errors['seed'] = 'Must be empty or have exactaly 32 characters';
    } else if (!this.state.seed.match(/^[a-zA-Z0-9]*$/)) {
      formIsValid = false;
      errors['seed'] = 'Invalid characters';
    }

    // didAlias
    if (this.state.didAlias === '') {
      formIsValid = false;
      errors['didAlias'] = 'Cannot be empty';
    }

    console.log(errors);
    this.setState({ errors: errors });
    return formIsValid;
  };

  onSubmit = (e) => {
    e.preventDefault();

    if (!this.handleValidation()) {
      console.log(this.state.errors);
      return;
    }

    const jwt = this.props.accessToken;

    axios.defaults.withCredentials = true;
    axios
      .post(
        `${config.endpoint}/api/wallet/create-did`,
        {
          seed: this.state.seed,
          alias: this.state.didAlias,
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
      .then((res) => {
        console.log(res.data);
        let dids = JSON.parse(localStorage.getItem('dids'));
        dids = [res.data.did, ...dids];
        localStorage.setItem('dids', JSON.stringify(dids));
        this.setState({
          dids: dids,
        });
        this.showSnackbarVariant('New DID added to your wallet.', 'success');
      })
      .catch((err) => {
        console.error(err);
        this.showSnackbarVariant('Error creating DID. Please try again.', 'error');
      });
  };

  getRole = (role) => {
    switch (role) {
      case '0':
        return 'Trustee user';
      case '2':
        return 'Steward user';
      case '101':
        return 'Trust anchor user';
      case '201':
        return 'Network monitor user';
      default:
        return 'Not in use';
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={`p-4 root-background`} style={{ minHeight: 'calc(100vh - 50px)' }}>
        <div>
          <h2>Welcome to SSI! :)</h2>
          <p>This is a self-sovereign identity app where you control your own identity!</p>
        </div>

        <Grid container>
          <Grid item xs={12}>
            <div className={`${classes.table}`} style={{ alignContent: 'center' }}>
              <h3>My DIDs:</h3>
              <CustomPaginationTable dids={this.state.dids} getRole={this.getRole} />
            </div>
          </Grid>
          <Grid item xs={12}>
            <Container maxWidth="xs" spacing={2}>
              <div className={classes.paper}>
                <Typography component="span" variant="h5">
                  Create a new DID
                </Typography>
                <form className={classes.form} onSubmit={this.onSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="didAlias"
                        label="Alias"
                        name="didAlias"
                        placeholder="DID Label"
                        value={this.state.didAlias}
                        onChange={this.handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        id="seed"
                        label="Seed"
                        name="seed"
                        placeholder="Leave this blank for a new random DID"
                        value={this.state.seed}
                        onChange={this.handleChange}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.btn}
                  >
                    Create
                  </Button>
                </form>
              </div>
            </Container>
          </Grid>
        </Grid>
      </div>
    );
  }
}

// Styles
const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
}))(TableRow);

// Styles
const useStyles = (theme) => ({
  btn: {
    height: 40,
    marginTop: 20,
  },
  table: {
    margin: 30,
  },
  paper: {
    marginTop: 40,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    '&:focus': {
      outline: 'none',
    },
  },
  add: {
    height: '40px',
    marginTop: 10,
  },
  form: {
    marginTop: theme.spacing(2),
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.auth.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(withSnackbar(Dashboard)));
