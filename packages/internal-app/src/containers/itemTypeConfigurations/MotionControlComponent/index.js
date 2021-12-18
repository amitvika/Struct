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
import { Checkbox } from '@mui/material';
import { getTableData } from './helper';
import { SELECTSOLID } from '@monostruct/common/gltf/Tree/utils';
export default function MotionControlComponent({
  itemId,
  gltfjson,
  setRenderData,
  setSelectedOption
}) {
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

  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

  const renderAxisMenu = () => {
    return itemList.map((item, index) => (
      <MenuItem value={index + 1}>{index + 1}</MenuItem>
    ));
  };

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
              <TableCell padding="none">Item name</TableCell>
              <TableCell padding="none">Axis Number</TableCell>
              <TableCell padding="none">Actuator Applies</TableCell>
              <TableCell padding="none">Machine’s Actuator Limits</TableCell>
              <TableCell padding="none">End Effector</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itemList.map((item) => (
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                onClick={() => {
                  setSelectedOption(SELECTSOLID);
                  setRenderData(
                    getTableData({ gltfjson, filePartName: item.filePartName })
                  );
                }}
              >
                <TableCell component="th" padding="none">
                  {item.name}
                </TableCell>
                <TableCell padding="none">
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
                      {renderAxisMenu()}
                    </Select>
                  ) : (
                    item.actuatorAxisNumber
                  )}
                </TableCell>
                <TableCell padding="none">
                  <Checkbox
                    {...label}
                    disabled={selectedValue !== item.id}
                    checked={item.isActuatorApplies}
                    onChange={(event) => {
                      updateAxisNumber(item.id, {
                        isActuatorApplies: event.target.checked
                      });
                    }}
                  />
                </TableCell>
                <TableCell padding="none"></TableCell>
                <TableCell padding="none">
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
