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
import { Checkbox } from '@mui/material';
import { getTableData } from './helper';
import { SELECTASSEMBLY } from '@monostruct/common/gltf/Tree/utils';
import {
  gltf_Dict,
  DEFAULTROWSELECTCOLOR
} from '@monostruct/common/gltf/Tree/utils';
import { useHistory } from 'react-router-dom';

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
  const [selectedValue, setSelectedValue] = React.useState('a');
  const [itemList, setItemList] = React.useState(kinematicItemList);
  const history = useHistory();

  React.useEffect(() => {
    ItemApi.getItemsAPI(`parent_id=${itemId}&is_actuator_type=true`)
      .then((res) => {
        console.log('IUPC Item Details', res, itemId);
        const thisList = get(res, 'data', []);
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
    //setSelectedOption(SELECTASSEMBLY);
    ItemApi.updateItemAPI(id, { actuator_motion_control: change })
      .then((res) => {
        setKinematicItemList(
          itemList.map((item) => (item.id === id ? res.data : item))
        );
      })
      .catch((error) => {});
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

    let linkUrl = `/items/${id}`;

    if (event.ctrlKey) {
      const win = window.open(linkUrl, '_blank');
      win.focus();
    } else {
      history.push(linkUrl);
    }
  };

  const SelectAxisMenu = ({ keyName, itemId, actuator_motion_control }) => {
    //setSelectedOption(SELECTASSEMBLY);
    return (
      <>
        {selectedValue === itemId ? (
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label={actuator_motion_control[keyName]}
            sx={{ width: '100%' }}
            value={actuator_motion_control[keyName]}
            onChange={(event) =>
              updateMotionControlActuator(itemId, {
                ...actuator_motion_control,
                [keyName]: event.target.value
              })
            }
          >
            {renderAxisMenu()}
          </Select>
        ) : (
          actuator_motion_control[keyName]
        )}
      </>
    );
  };

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
              <TableCell padding="none">Axis Before Link</TableCell>
              <TableCell padding="none">Axis After Link</TableCell>
              <TableCell padding="none">Machine’s Actuator Limits</TableCell>
              <TableCell padding="none">End Effector</TableCell>
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
                    /*                     setSelectedValue(item.id);
                    setSelectedOption(SELECTASSEMBLY);
                    setRenderData(
                      getTableData({
                        gltfjson,
                        filePartName: itemName(item)
                      })
                    ); */
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
                        keyName: 'child_sequence_number',
                        itemId: item.id,
                        actuator_motion_control
                      }}
                    />
                  </TableCell>
                  <TableCell padding="none">
                    <Checkbox
                      {...label}
                      disabled={selectedValue !== item.id}
                      checked={
                        actuator_motion_control.is_actuator_or_chain_link
                      }
                      onChange={(event) =>
                        updateMotionControlActuator(item.id, {
                          ...actuator_motion_control,
                          is_actuator_or_chain_link: event.target.checked
                        })
                      }
                    />
                  </TableCell>
                  <TableCell padding="none">
                    <SelectAxisMenu
                      {...{
                        keyName: 'axis_before_link',
                        itemId: item.id,
                        actuator_motion_control
                      }}
                    />
                  </TableCell>
                  <TableCell padding="none">
                    <SelectAxisMenu
                      {...{
                        keyName: 'axis_after_link',
                        itemId: item.id,
                        actuator_motion_control
                      }}
                    />
                  </TableCell>
                  <TableCell padding="none"></TableCell>
                  <TableCell padding="none">
                    <Radio
                      checked={actuator_motion_control.is_end_effector}
                      name="radio-buttons"
                      inputProps={{ 'aria-label': 'A' }}
                      onChange={(event) =>
                        updateMotionControlActuator(item.id, {
                          ...actuator_motion_control,
                          is_end_effector: event.target.checked
                        })
                      }
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
