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
    ItemApi.updateItemAPI(id, { actuator_motion_control: change })
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
  const itemName = (item) => {
    return item.name
      ? item.name + '0' == item.fileStore
        ? item.filePartName
          ? item.filePartName
          : item.name
        : item.name
      : item.filePartName
      ? item.filePartName
      : 'Untitled-2';
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
            {itemList.map((item) => {
              const actuator_motion_control =
                item.actuator_motion_control || {};
              return (
                <TableRow
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  onClick={() => {
                    setSelectedOption(SELECTSOLID);
                    setRenderData(
                      getTableData({
                        gltfjson,
                        filePartName: itemName(item)
                      })
                    );
                  }}
                >
                  <TableCell component="th" padding="none">
                    {itemName(item)}
                  </TableCell>
                  <TableCell padding="none">
                    {' '}
                    {selectedValue === item.id ? (
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label={actuator_motion_control.child_sequence_number}
                        sx={{ width: '100%' }}
                        value={actuator_motion_control.child_sequence_number}
                        onChange={(event) => {
                          updateAxisNumber(item.id, {
                            child_sequence_number: event.target.value
                          });
                        }}
                      >
                        {renderAxisMenu()}
                      </Select>
                    ) : (
                      actuator_motion_control.child_sequence_number
                    )}
                  </TableCell>
                  <TableCell padding="none">
                    <Checkbox
                      {...label}
                      disabled={selectedValue !== item.id}
                      checked={
                        actuator_motion_control.is_actuator_or_chain_link
                      }
                      onChange={(event) => {
                        updateAxisNumber(item.id, {
                          is_actuator_or_chain_link: event.target.checked
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
