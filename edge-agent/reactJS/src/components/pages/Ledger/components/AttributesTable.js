import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { TableHead } from '@material-ui/core';
import { AutoSizer } from 'react-virtualized';

const columns = [{ id: 'name', label: 'Name', width: 240 }];

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

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

export default function AttributesTable(props) {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <TableContainer style={{ tableLayout: 'auto', overflowY: 'hidden' }}>
        <Table stickyHeader size="small">
          <TableHead style={{ display: 'table', width: '100%' }}>
            <StyledTableRow>
              <StyledTableCell align="center" colSpan={3}>
                <strong>Attributes</strong>
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody
            className="scrollBar"
            style={{
              display: 'block',
              overflowY: 'auto',
              height: 180,
            }}
          >
            {props.rows.map((row) => {
              return (
                <StyledTableRow
                  style={{
                    height: '40px !important',
                    display: 'table',
                    margin: 'auto',
                    width: '100%',
                  }}
                  hover
                  key={row.id}
                >
                  {columns.map((column) => {
                    return (
                      <StyledTableCell key={column.id} align="left">
                        {row[column.id]}
                      </StyledTableCell>
                    );
                  })}
                  <StyledTableCell key="edit" align="right" style={{ padding: 0, width: 70 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        style={{ padding: 5 }}
                        aria-label="edit"
                        onClick={() => props.onEditAttribute()}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell
                    key="delete"
                    align="right"
                    style={{ padding: 0, paddingRight: 5, width: 50 }}
                  >
                    <Tooltip title="Delete">
                      <IconButton
                        style={{ padding: 5 }}
                        aria-label="delete"
                        onClick={() => props.onDeleteAttribute(row.id)}
                      >
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
