import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

export default function DisplayAttributesTable({ columns, rows, idColumn, width }) {
  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="a dense table" style={{ width: width }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell style={{ verticalAlign: 'bottom' }}>
                <strong>{col.label}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row[idColumn]}>
              {columns.map((col) => (
                <TableCell component="th" scope="row">
                  {row[col.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
