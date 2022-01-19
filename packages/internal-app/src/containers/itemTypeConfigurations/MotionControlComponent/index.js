import React from 'react';
import Link from '@mui/material/Link';
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
import { getTableData } from './helper';
import { SELECTASSEMBLY } from '@monostruct/common/gltf/Tree/utils';
import {
  gltf_Dict,
  DEFAULTROWSELECTCOLOR
} from '@monostruct/common/gltf/Tree/utils';
import { useHistory } from 'react-router-dom';
import { AlertContext } from '@monostruct/common/context/AlertContext/AlertContext';
import TextField from '@mui/material/TextField';

export default function MotionControlComponent({
  onClick,
  mykey,
  itemId,
  gltfjson,
  setRenderData,
  setSelectedOption,
  kinematicItemList,
  setKinematicItemList,
  selected3JSData,
  showKinematicMove
}) {
  const alertContext = React.useContext(AlertContext);

  const [selectedValue, setSelectedValue] = React.useState('a');
  const [itemList, setItemList] = React.useState(kinematicItemList);
  const history = useHistory();

  React.useEffect(() => {
    ItemApi.getItemsAPI(`parent_id=${itemId}&is_actuator_type=true`)
      .then((res) => {
        console.log('IUPC Item Details', res, itemId);
        let thisList = get(res, 'data', []);
        if (thisList) {
          for (let index = 0; index < thisList.length; index++) {
            let item = { ...thisList[index] };
            const actuator_motion_control = item.actuator_motion_control || {};
            item.actuator_motion_control.axis_number =
              actuator_motion_control.axis_number
                ? actuator_motion_control.axis_number
                : Array.isArray(actuator_motion_control.child_sequence_number)
                ? actuator_motion_control.child_sequence_number.length >= 1
                  ? actuator_motion_control.child_sequence_number[0]
                  : actuator_motion_control.axis_number
                : actuator_motion_control.child_sequence_number;
            item.actuator_motion_control.child_sequence_number =
              actuator_motion_control.axis_number
                ? actuator_motion_control.child_sequence_number
                  ? Array.isArray(actuator_motion_control.child_sequence_number)
                    ? actuator_motion_control.child_sequence_number
                    : [1]
                  : [1]
                : [1];
            item.actuator_motion_control.child_chain_number =
              actuator_motion_control.child_chain_number
                ? Array.isArray(actuator_motion_control.child_chain_number)
                  ? 0
                  : actuator_motion_control.child_chain_number
                : actuator_motion_control.child_chain_number;
            if (
              actuator_motion_control.rotational_angle_limit == 0 &&
              actuator_motion_control.is_linear_or_rotational == false
            ) {
              item.actuator_motion_control.rotational_angle_limit = Math.PI / 3;
            }
            console.log(
              'Changing structure from',
              thisList[index],
              'To ',
              item
            );
            thisList[index] = item;
          }
        }
        setItemList(thisList);
        setKinematicItemList(thisList);
        //setSelectedOption(SELECTASSEMBLY);
      })
      .catch((error) => {});
  }, []);

  React.useEffect(() => {
    setItemList(kinematicItemList);
    setSelectedOption(SELECTASSEMBLY);
    //console.log('Reaching here to change option to Select Assembly');
  }, [kinematicItemList]);

  React.useEffect(() => {
    //console.log('I have got changed selection', selected3JSData);
    let selectedAnItem = false;
    if (selected3JSData && selected3JSData.length == 2) {
      let parentNode = selected3JSData[1];
      if (!parentNode) {
        parentNode = selected3JSData[0][0];
      }
      if (parentNode) {
        for (let index = 0; index < itemList.length; index++) {
          const element = itemList[index];
          console.log(
            'Checking to match',
            element.filePartName,
            parentNode,
            parentNode[gltf_Dict['display']],
            parentNode[gltf_Dict['name']],
            element.filePartName == parentNode[gltf_Dict['display']] ||
              element.filePartName == parentNode[gltf_Dict['name']]
          );
          if (
            element.filePartName == parentNode[gltf_Dict['display']] ||
            element.filePartName == parentNode[gltf_Dict['name']]
          ) {
            //console.log('Got to select', element);
            setSelectedValue(element.id);
            selectedAnItem = true;
          }
        }
      }
      if (selectedAnItem == false) {
        console.log(
          'I could not get an item to select from',
          itemList,
          'with',
          selected3JSData,
          parentNode,
          selected3JSData.length
        );
      }
    }
  }, [selected3JSData]);

  const updateMotionControlActuator = (id, change) => {
    ItemApi.updateItemAPI(id, { actuator_motion_control: change })
      .then((res) => {
        if (res.data) {
          alertContext.openSuccessAlert({ message: 'Actuator updated' });
        }
        setKinematicItemList(
          itemList.map((item) => (item.id === id ? res.data : item))
        );
        setItemList(itemList.map((item) => (item.id === id ? res.data : item)));
      })
      .catch((error) => {
        console.log('Error while updating', error);
        alertContext.openErrorAlert({
          message: 'Some error occured ' + error.toString()
        });
      });
  };

  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

  const renderAxisMenu = () => {
    //setSelectedOption(SELECTASSEMBLY);
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

  const handleItemNameClick = (event, id) => {
    event.stopPropagation();

    let linkUrl = `/items/${id}?tab=iupc`;

    if (event.ctrlKey) {
      const win = window.open(linkUrl, '_blank');
      win.focus();
    } else {
      history.push(linkUrl);
    }
  };

  const SelectAxisMenu = ({ itemId, multiple, onChange, value, label }) => {
    if (selectedValue === itemId) {
      return (
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          sx={{ width: '100%' }}
          {...{
            multiple,
            onChange,
            value,
            label
          }}
        >
          {renderAxisMenu()}
        </Select>
      );
    }

    return `${value}`;
  };

  /* const handleOnChangeChain = (e) => (itemId, actuator_motion_control) => {
    if (e.keyCode === 13) {
      updateMotionControlActuator(itemId, {
        ...actuator_motion_control,
        child_chain_number: e.target.value
      });
    }
  }; */

  return (
    <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
      <Typography
        sx={{ flex: '1 1 100%', fontWeight: 'bold' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        Actuators in Motion Control Machine
      </Typography>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell padding="none">Item name</TableCell>
              <TableCell padding="none">Axis Number</TableCell>
              <TableCell padding="none">Link applies</TableCell>
              <TableCell padding="none">Machine’s Actuator Limits</TableCell>
              <TableCell padding="none">End Effector</TableCell>
              {/*  <TableCell padding="none">Chain #</TableCell> */}
              <TableCell padding="none">Chain Numbers</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itemList.map((item) => {
              const actuator_motion_control =
                item.actuator_motion_control || {};
              //console.log('Assinging table row', selectedValue, item.id);
              return (
                <TableRow
                  style={{
                    background:
                      selectedValue == item.id
                        ? DEFAULTROWSELECTCOLOR()
                        : 'white'
                  }}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor:
                      selectedValue == item.id
                        ? DEFAULTROWSELECTCOLOR()
                        : 'white'
                  }}
                  onClick={() => {
                    if (showKinematicMove) {
                      return;
                    }
                    setSelectedValue(item.id);
                    setSelectedOption(SELECTASSEMBLY);
                    const tableData = getTableData({
                      gltfjson,
                      filePartName: itemName(item)
                    });
                    setRenderData(tableData, {
                      name: 'NoKey',
                      option: SELECTASSEMBLY
                    });
                    console.log('Clicked and Sent', tableData, item.id);
                    onClick(mykey);
                  }}
                >
                  <TableCell component="th" padding="none">
                    <Link
                      component="button"
                      color="primary"
                      sx={{ textAlign: 'left' }}
                      onClick={(event) => handleItemNameClick(event, item.id)}
                    >
                      {itemName(item)}
                    </Link>
                  </TableCell>
                  <TableCell padding="none">
                    <SelectAxisMenu
                      {...{
                        itemId: item.id,
                        value: actuator_motion_control.axis_number
                          ? actuator_motion_control.axis_number
                          : Array.isArray(
                              actuator_motion_control.child_sequence_number
                            )
                          ? actuator_motion_control.child_sequence_number
                              .length >= 1
                            ? actuator_motion_control.child_sequence_number[0]
                            : actuator_motion_control.axis_number
                          : actuator_motion_control.child_sequence_number,
                        onChange: (event) =>
                          updateMotionControlActuator(item.id, {
                            ...actuator_motion_control,
                            axis_number: event.target.value
                          })
                      }}
                    />
                  </TableCell>
                  <TableCell padding="none">
                    {selectedValue === item.id ? (
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={actuator_motion_control.child_part_type}
                        onChange={(event) =>
                          updateMotionControlActuator(item.id, {
                            ...actuator_motion_control,
                            child_part_type: event.target.value
                          })
                        }
                      >
                        <MenuItem value={'STATIC'}>Static</MenuItem>
                        <MenuItem value={'ACTUATOR'}>Actuator</MenuItem>
                        <MenuItem value={'LINKAGE'}>Linkage</MenuItem>
                      </Select>
                    ) : (
                      <>{actuator_motion_control.child_part_type}</>
                    )}
                  </TableCell>
                  <TableCell padding="none">
                    {actuator_motion_control.child_part_type == 'ACTUATOR'
                      ? actuator_motion_control.is_linear_or_rotational
                        ? Number(
                            actuator_motion_control.linear_distance_limit
                          ).toFixed(3)
                        : Number(
                            actuator_motion_control.rotational_angle_limit
                          ).toFixed(3)
                      : ''}
                  </TableCell>
                  <TableCell padding="none">
                    <Radio
                      checked={actuator_motion_control.is_end_effector}
                      name="radio-buttons"
                      inputProps={{ 'aria-label': 'A' }}
                      value={'is_end_effector'}
                      onClick={(event) => {
                        event.stopPropagation();
                        updateMotionControlActuator(item.id, {
                          ...actuator_motion_control,
                          is_end_effector:
                            !actuator_motion_control.is_end_effector
                        });
                      }}
                    />
                  </TableCell>
                  {/* <TableCell padding="none">
                    {selectedValue === item.id ? (
                      <TextField
                        id="standard-basic"
                        variant="standard"
                        size="small"
                        type="number"
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        onKeyDown={(event) =>
                          handleOnChangeChain(event)(
                            item.id,
                            actuator_motion_control
                          )
                        }
                      />
                    ) : (
                      <>{actuator_motion_control.child_chain_number}</>
                    )}
                  </TableCell> */}

                  <TableCell padding="none">
                    <SelectAxisMenu
                      {...{
                        itemId: item.id,
                        multiple: true,
                        value: actuator_motion_control.child_sequence_number
                          ? Array.isArray(
                              actuator_motion_control.child_sequence_number
                            )
                            ? actuator_motion_control.child_sequence_number
                            : [1]
                          : [1],
                        onChange: (event) =>
                          updateMotionControlActuator(item.id, {
                            ...actuator_motion_control,
                            child_sequence_number: event.target.value
                          })
                      }}
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
