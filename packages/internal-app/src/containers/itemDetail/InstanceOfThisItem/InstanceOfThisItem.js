import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData(
    'Frozen yoghurt',
    'Hello World',
    'Initial Upload',
    'Duplicate Analysis Link'
  ),
  createData(
    'Ice cream sandwich',
    'Hello World',
    'New Upload',
    'Duplicate Analysis Link'
  ),
  createData('Eclair', 'Hello World', 'Child Item', 'Duplicate Analysis Link')
];

export default function InstanceOfThisItem() {
  return (
    <Paper>
      <Typography
        sx={{ flex: '1 1 100%', fontWeight: 'bold' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        Actuators in Motion Control Machine
      </Typography>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Description</TableCell>
              <TableCell align="right">Reference Type</TableCell>
              <TableCell align="right">Update Reference</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">{row.calories}</TableCell>
                <TableCell align="right">{row.fat}</TableCell>
                <TableCell align="right">{row.carbs}</TableCell>
                <TableCell align="right">{row.protein}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
