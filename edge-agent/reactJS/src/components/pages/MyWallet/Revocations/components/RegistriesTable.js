import React, { useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Tooltip from '@material-ui/core/Tooltip';
import TableHead from '@material-ui/core/TableHead';
import PublishIcon from '@material-ui/icons/Publish';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import RowInfoDialog from '../../../../sharedComponents/RowInfoDialog';
import TablePaginationActions from '../../../../TablePaginationActions';
const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontSize: 16,
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
    cursor: 'pointer',
  },
}))(TableRow);

export default function RegistriesTable({
  columns,
  rows,
  minRows,
  onRevokeCredential,
  onPublishPending,
  rowHeight,
}) {
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, (rows || []).length - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const classes = useStyles();

  const onRowClick = (registry) => {
    setSelectedRow(registry);
    setIsInfoDialogOpen(true);
  };

  return (
    <Paper className={classes.root}>
      <TableContainer style={{ tableLayout: 'auto' }}>
        <Table size="small" width="100%">
          <TableHead>
            <TableRow height={rowHeight}>
              {columns.map((column) => {
                return (
                  <StyledTableCell
                    key={column.label}
                    align="left"
                    style={{ verticalAlign: 'bottom' }}
                  >
                    <strong>{column.label}</strong>
                  </StyledTableCell>
                );
              })}
              <StyledTableCell
                align="left"
                style={{ verticalAlign: 'bottom', width: 100 }}
              ></StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? (rows || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : rows || []
            ).map((row) => (
              <StyledTableRow
                onClick={() => onRowClick(row.registry)}
                style={{ height: rowHeight }}
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
                <StyledTableCell key="revoke" align="right" style={{ padding: 0, width: 100 }}>
                  <Tooltip title="Revoke crendetial">
                    <HighlightOffIcon
                      className="mx-3"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRevokeCredential(row.registry.revocRegId);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Publish all pending revocations">
                    <PublishIcon
                      className="mr-3"
                      onClick={(event) => {
                        event.stopPropagation();
                        row.pendingRevocations === 0
                          ? alert('The registry selected does not have pending Revocations.')
                          : onPublishPending(row.registry.revocRegid);
                      }}
                    />
                  </Tooltip>
                </StyledTableCell>
              </StyledTableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: rowHeight * emptyRows }}>
                <StyledTableCell colSpan={Object.keys(columns).length + 1} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <StyledTableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 15, 20, { label: 'All', value: -1 }]}
                colSpan={Object.keys(columns).lenght + 1}
                count={(rows || []).length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </StyledTableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <RowInfoDialog
        title="Registry Information"
        data={selectedRow}
        open={isInfoDialogOpen}
        handleClose={() => setIsInfoDialogOpen(false)}
      />
    </Paper>
  );
}
