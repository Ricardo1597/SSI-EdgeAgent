import React, { Component } from 'react';
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

import axios from 'axios';
import config from '../../config';

class Dashboard extends Component {
  state = {
    seed: '',
    alias: '',
    dids: JSON.parse(localStorage.getItem('dids')),
    errors: [],
  };

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

    // alias
    if (this.state.alias === '') {
      formIsValid = false;
      errors['alias'] = 'Cannot be empty';
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
          alias: this.state.alias,
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
      })
      .catch((err) => {
        console.error(err);
        alert('Error creating DID. Please try again.');
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
      <div className={classes.pageMargin}>
        <div>
          <h2>Welcome to SSI! :)</h2>
          <p>This is a self-sovereign identity app where you control your own identity!</p>
        </div>

        <Grid container>
          <Grid item xs={12} lg={5}>
            <Container maxWidth="xs" spacing={2}>
              <div className={classes.paper}>
                <Typography component="span" variant="h5">
                  Create a DID
                </Typography>
                <form className={classes.form} onSubmit={this.onSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="alias"
                        label="Alias"
                        name="alias"
                        placeholder="DID Label"
                        value={this.state.alias}
                        onChange={this.handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8}>
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
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      className={classes.btn}
                    >
                      Create
                    </Button>
                  </Grid>
                </form>
              </div>
            </Container>
          </Grid>
        </Grid>

        <TableContainer className={classes.table} component={Paper}>
          <h3>Your DIDs:</h3>

          <Table size="small" aria-label="customized table">
            <TableHead>
              <TableRow height="40px">
                <StyledTableCell align="center">DID</StyledTableCell>
                <StyledTableCell align="center">Alias</StyledTableCell>
                <StyledTableCell align="center">Role</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.dids.map((did) => (
                <StyledTableRow key={did.did}>
                  <StyledTableCell align="center">{did.did}</StyledTableCell>
                  <StyledTableCell align="center">{did.metadata.alias}</StyledTableCell>
                  <StyledTableCell align="center">
                    {did.did.includes('peer') ? 'Peer did' : this.getRole(did.role)}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
    margin: 22,
  },
  table: {
    margin: 30,
    width: '800px',
  },
  pageMargin: {
    margin: 30,
  },
  paper: {
    marginTop: 30,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    width: '500px',
    marginTop: theme.spacing(2),
  },
});

const mapStateToProps = (state) => {
  return {
    accessToken: state.accessToken,
  };
};

export default connect(mapStateToProps)(withStyles(useStyles)(Dashboard));
