import React, { useState } from 'react';
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

import AttributeInfoDialog from './AttributeInfoDialog';

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

export default function AttributesTable({
  title,
  columns,
  showHeader,
  rows,
  minRows,
  rowHeight,
  onDeleteAttribute,
  onEditAttribute,
  isPredicate,
  isRequest,
}) {
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  const classes = useStyles();
  const emptyRows = minRows - rows.length;
  console.log(40 * emptyRows);

  const onRowClick = (attribute) => {
    setIsInfoDialogOpen(true);
    setSelectedAttribute(attribute);
  };

  const handleCloseInfoDialog = () => {
    setIsInfoDialogOpen(false);
  };

  return (
    <Paper className={classes.root}>
      <TableContainer style={{ tableLayout: 'auto' }}>
        <Table size="small">
          {showHeader ? (
            <TableHead height="40px">
              <StyledTableRow>
                <StyledTableCell align="center" colSpan={columns.length + 2}>
                  <strong>{title}</strong>
                </StyledTableCell>
              </StyledTableRow>
            </TableHead>
          ) : null}
          <TableBody>
            {rows.map((row) => {
              console.log(row);
              return (
                <StyledTableRow
                  onClick={() => onRowClick(row)}
                  style={{ height: '40px !important' }}
                  hover
                  key={row.id}
                >
                  {columns.map((column) => {
                    return (
                      <StyledTableCell key={column.id} align="center">
                        {row[column.id]}
                      </StyledTableCell>
                    );
                  })}
                  <StyledTableCell key="edit" align="right" style={{ padding: 0, width: 70 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        style={{ padding: 5 }}
                        aria-label="edit"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditAttribute(row.name);
                        }}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                  <StyledTableCell key="delete" align="right" style={{ padding: 0, width: 50 }}>
                    <Tooltip title="Delete">
                      <IconButton
                        style={{ padding: 5 }}
                        aria-label="delete"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteAttribute(row.name);
                        }}
                      >
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}

            {emptyRows > 0 && (
              <TableRow style={{ height: 35 * emptyRows }}>
                <StyledTableCell colSpan={columns.length + 2} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <AttributeInfoDialog
        attribute={selectedAttribute}
        open={isInfoDialogOpen}
        handleClose={handleCloseInfoDialog}
        isPredicate={isPredicate}
        isRequest={isRequest}
      />
    </Paper>
  );
}
