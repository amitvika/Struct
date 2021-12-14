import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Radio from '@mui/material/Radio';

export default function MotionControlComponent() {
  const [selectedValue, setSelectedValue] = React.useState('a');

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  return (
    <Paper style={{ minWidth: 400 }}>
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
              <TableCell>Item name</TableCell>
              <TableCell align="right">Axis Number</TableCell>
              <TableCell align="right">End Effector</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row"></TableCell>
              <TableCell align="right">
                {' '}
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Age"
                >
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </TableCell>
              <TableCell align="right">
                <Radio
                  checked={selectedValue === 'a'}
                  onChange={handleChange}
                  value="a"
                  name="radio-buttons"
                  inputProps={{ 'aria-label': 'A' }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
