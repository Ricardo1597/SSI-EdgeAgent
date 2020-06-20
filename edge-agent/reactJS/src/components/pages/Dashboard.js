import React, { useState } from 'react'
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
import { connect } from 'react-redux';


import axios from 'axios';
import config from '../../config'


function Dashboard(props) {
    const [seed, setSeed] = useState("");
    const [dids, setDIDs] = useState(JSON.parse(localStorage.getItem('dids')))
  
    const onSubmit = (e) => {
      e.preventDefault();
      const jwt = props.accessToken

      axios.defaults.withCredentials = true;
      axios.post(`${config.endpoint}/api/wallet/create-did`, {
        seed
      }, { 
        headers: { Authorization: `Bearer ${jwt}`} 
      })
      .then(res => {
        console.log(res)
        localStorage.setItem('dids', JSON.stringify(res.data.dids))
        setDIDs(JSON.parse(localStorage.getItem('dids')))
      })
      .catch(err => {
          console.error(err);
          alert('Error creating DID. Please try again.');
      });
    }

    const getRole = (role) => {
        switch(role){
            case null: return "Common user";
            case "0": return "Trustee user";
            case "2": return "Steward user";
            case "101": return "Trust anchor user";
            case "201": return "Network monitor user";
            default: return "peer did";
        }
    }


    return (

        <div style={styles.pageMargin}>
            <div>
                <h2>Welcome to SSI! :)</h2>
                <p>This is a self-sovereign identity app where you control your own identity!</p> 
            </div>

            <div style={styles.form}>
                <h3>Create a DID</h3>
                <form  onSubmit={onSubmit}>
                    <Grid container spacing={1}>
                      <TextField 
                          variant="outlined"
                          margin="normal"
                          type="text"
                          id="seed"
                          label="Seed"
                          name="seed"
                          placeholder='Leave this blank for a new random DID' 
                          autoFocus
                          value={seed}
                          onChange={e => setSeed(e.target.value)}
                          style={styles.input}
                      />
                      <Button 
                          type="submit"
                          variant="contained"
                          color="primary" 
                          style={styles.btn}
                      >Create
                      </Button>
                    </Grid>
                </form>
            </div>

            <TableContainer style={styles.table} component={Paper}>
                <h3>Your DIDs:</h3>

                <Table size="small" aria-label="customized table">
                    <TableHead>
                    <TableRow height='40px'>
                        <StyledTableCell width='50%' align="center" >DID</StyledTableCell>
                        <StyledTableCell align="center">Role</StyledTableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {dids.map((did) => (
                        <StyledTableRow key={did.did}>
                        <StyledTableCell align="center">{did.did}</StyledTableCell>
                        <StyledTableCell align="center">{getRole(did.role)}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>           

        </div>
    )
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


const styles = {
    form: {
        margin: 30
    },
    btn: {
        height: 40,
        margin: 22,
    },
    input: {
        width: '400px',
    },
    table: {
        margin: 30,
        width: '500px',
    },
    pageMargin: {
        margin: 30,
    }
}

const mapStateToProps = (state) => {
  return {
      accessToken: state.accessToken
  }
}

export default connect(mapStateToProps)(Dashboard)