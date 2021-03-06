import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TableHead from '@material-ui/core/TableHead';

import TablePaginationActions from '../../../../TablePaginationActions';
import RowInfoDialog from '../../../../sharedComponents/RowInfoDialog';

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

const CustomPaginationTable = ({ dids, getRole }) => {
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, (dids || []).length - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onRowClick = (row) => {
    setSelectedRow(row);
    setIsInfoDialogOpen(true);
  };

  return (
    <TableContainer component={Paper} style={{ tableLayout: 'auto' }}>
      <Table size="small" aria-label="customized table">
        <TableHead>
          <TableRow height="45px">
            <StyledTableCell align="left" style={{ verticalAlign: 'bottom' }}>
              <strong>Alias</strong>
            </StyledTableCell>
            <StyledTableCell
              align="left"
              style={{ verticalAlign: 'bottom' }}
              hidden={window.innerWidth < 850}
            >
              <strong>DID</strong>
            </StyledTableCell>
            <StyledTableCell
              align="left"
              style={{ verticalAlign: 'bottom' }}
              hidden={window.innerWidth < 1300}
            >
              <strong>Verkey</strong>
            </StyledTableCell>
            <StyledTableCell align="left" style={{ verticalAlign: 'bottom' }}>
              <strong>Role</strong>
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? (dids || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : dids || []
          ).map((row) => (
            <StyledTableRow key={row.did} height="45px" hover onClick={() => onRowClick(row)}>
              <StyledTableCell align="left">{row.metadata.alias}</StyledTableCell>
              <StyledTableCell align="left" hidden={window.innerWidth < 850}>
                {row.did}
              </StyledTableCell>
              <StyledTableCell align="left" hidden={window.innerWidth < 1300}>
                {row.verkey}
              </StyledTableCell>
              <StyledTableCell align="left">
                {row.did.includes('peer') ? 'Peer did' : getRole(row.role)}
              </StyledTableCell>
            </StyledTableRow>
          ))}
          {emptyRows > 0 && (
            <TableRow style={{ height: 40 * emptyRows }}>
              <StyledTableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <StyledTableRow>
            <TablePagination
              rowsPerPageOptions={[10, 15, 25, 50, { label: 'All', value: -1 }]}
              colSpan={4}
              count={(dids || []).length}
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
      <RowInfoDialog
        title="DID Information"
        data={selectedRow}
        open={isInfoDialogOpen}
        handleClose={() => setIsInfoDialogOpen(false)}
      />
    </TableContainer>
  );
};

export default CustomPaginationTable;
