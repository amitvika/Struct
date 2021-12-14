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
import ItemApi from '@monostruct/common/api/items.api';
import { get } from 'lodash';

export default function MotionControlComponent({ itemId }) {
  const [selectedValue, setSelectedValue] = React.useState('a');
  const [itemList, setItemList] = React.useState([]);

  React.useEffect(() => {
    ItemApi.getItemsAPI(`parent_id=${itemId}`)
      .then((res) => {
        setItemList(get(res, 'data', []));
      })
      .catch((error) => {});
  }, []);

  const updateAxisNumber = (id, change) => {
    ItemApi.updateItemAPI(id, change)
      .then((res) => {
        setItemList(itemList.map((item) => (item.id === id ? res.data : item)));
      })
      .catch((error) => {});
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  return (
    <Paper style={{ width: '70%' }}>
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
            {itemList.map((item) => (
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {item.name}
                </TableCell>
                <TableCell align="right">
                  {' '}
                  {selectedValue === item.id ? (
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label={item.actuatorAxisNumber}
                      sx={{ width: '100%' }}
                      value={item.actuatorAxisNumber}
                      onChange={(event) => {
                        updateAxisNumber(item.id, {
                          actuatorAxisNumber: event.target.value
                        });
                      }}
                    >
                      <MenuItem value={0}>0</MenuItem>
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                      <MenuItem value={4}>4</MenuItem>
                    </Select>
                  ) : (
                    item.actuatorAxisNumber
                  )}
                </TableCell>
                <TableCell align="right">
                  <Radio
                    checked={selectedValue === item.id}
                    onChange={handleChange}
                    value={item.id}
                    name="radio-buttons"
                    inputProps={{ 'aria-label': 'A' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
