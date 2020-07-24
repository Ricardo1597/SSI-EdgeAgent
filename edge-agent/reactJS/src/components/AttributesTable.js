import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
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

const columns = [
  { id: 'name', label: 'Name', width: 240 },
  { id: 'value', label: 'Value', width: 240 },
];

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

export default function AttributesTable(props) {
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <TableContainer style={{ height: props.height }}>
        <Table>
          <TableBody>
            {props.rows.map((row) => {
              return (
                <TableRow style={{ height: props.rowHeight }} hover key={row.id}>
                  {columns.map((column) => {
                    return (
                      <TableCell
                        style={{ width: column.width }}
                        key={column.id}
                        align={column.align}
                      >
                        {row[column.id]}
                      </TableCell>
                    );
                  })}
                  <TableCell key="edit" align="right" style={{ padding: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton aria-label="edit" onClick={() => props.onEditAttribute()}>
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell key="delete" align="right" style={{ padding: 0 }}>
                    <Tooltip title="Delete">
                      <IconButton
                        aria-label="delete"
                        onClick={() => props.onDeleteAttribute(row.id)}
                      >
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
