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
import Slider from '@mui/material/Slider';
import ItemApi from '@monostruct/common/api/items.api';
import { get } from 'lodash';
import { getTableData } from './helper';
import {
  SELECTFEATURE,
  SELECTASSEMBLY
} from '@monostruct/common/gltf/Tree/utils';
import {
  gltf_Dict,
  DEFAULTROWSELECTCOLOR
} from '@monostruct/common/gltf/Tree/utils';
import { useHistory } from 'react-router-dom';
import { AlertContext } from '@monostruct/common/context/AlertContext/AlertContextProvider';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';

const BootstrapSelect = styled(Select)(({ theme }) => ({
  'label + &': {
    marginTop: theme.spacing(3)
  },
  '& .MuiSelect-select': {
    padding: '5px'
  }
}));

const BootstrapTableCell = styled(TableCell)(({ theme }) => ({
  '& .MuiTableCell-root': {
    padding: '3px'
  }
}));

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
  showKinematicMove,
  showKinematicSliderMove,
  showKinematicSliderAnimate,
  showKinematicSliderAnimateValues,
  applyTangentToEdges
}) {
  const alertContext = React.useContext(AlertContext);

  const [selectedValue, setSelectedValue] = React.useState('a');
  const [itemList, setItemList] = React.useState(kinematicItemList);
  const history = useHistory();

  const getAxisNumber = (actuator_motion_control) => {
    if (get(actuator_motion_control, 'axis_number')) {
      return actuator_motion_control.axis_number;
    } else if (Array.isArray(actuator_motion_control.child_sequence_number)) {
      if (actuator_motion_control.child_sequence_number.length >= 1) {
        return actuator_motion_control.child_sequence_number[0];
      } else {
        return actuator_motion_control.axis_number;
      }
    } else {
      return actuator_motion_control.child_sequence_number;
    }
  };

  React.useEffect(() => {
    ItemApi.getItemsAPI(`parent_id=${itemId}&is_actuator_type=true`)
      .then((res) => {
        console.log('IUPC Item Details', res, itemId);
        let thisList = get(res, 'data', []);
        if (thisList) {
          for (let index = 0; index < thisList.length; index++) {
            let item = { ...thisList[index] };
            const actuator_motion_control = get(
              item,
              'actuator_motion_control',
              {}
            );

            if (!item.actuator_motion_control) {
              item.actuator_motion_control = {};
            }

            item.actuator_motion_control.axis_number = getAxisNumber(
              actuator_motion_control
            );

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
              actuator_motion_control.child_part_type === 'ACTUATOR' &&
              actuator_motion_control.rotational_angle_limit === 0 &&
              actuator_motion_control.is_linear_or_rotational === false
            ) {
              item.actuator_motion_control.rotational_angle_limit = Math.PI / 3;
            }
            item.actuator_motion_control.machine_actuator_limit =
              actuator_motion_control.machine_actuator_limit
                ? actuator_motion_control.machine_actuator_limit
                : actuator_motion_control.child_part_type === 'ACTUATOR'
                ? actuator_motion_control.is_linear_or_rotational
                  ? actuator_motion_control.linear_distance_limit
                  : actuator_motion_control.rotational_angle_limit
                : null;
            item.actuator_motion_control.maximum_limit =
              actuator_motion_control.child_part_type === 'ACTUATOR'
                ? getLimit(item.actuator_motion_control)
                : 0;
            item.actuator_motion_control.minimum_limit =
              -item.actuator_motion_control.maximum_limit;
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
      .catch((error) => {
        console.log('-------------------', error);
      });
  }, []);

  React.useEffect(() => {
    setItemList(kinematicItemList);
    setSelectedOption(showKinematicSliderMove ? SELECTFEATURE : SELECTASSEMBLY);
    console.log(
      'Reaching here to change items of itemlist',
      kinematicItemList,
      itemList
    );
  }, [kinematicItemList]);

  React.useEffect(() => {
    //console.log('I have got changed selection', selected3JSData);
    let selectedAnItem = false;
    if (selected3JSData && selected3JSData.length === 2) {
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
            element.filePartName === parentNode[gltf_Dict['display']] ||
              element.filePartName === parentNode[gltf_Dict['name']]
          );
          if (
            element.filePartName === parentNode[gltf_Dict['display']] ||
            element.filePartName === parentNode[gltf_Dict['name']]
          ) {
            //console.log('Got to select', element);
            setSelectedValue(element.id);
            selectedAnItem = true;
          }
        }
      }
      if (selectedAnItem === false) {
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
    console.log('Changing backend', change);
    ItemApi.updateItemAPI(id, { actuator_motion_control: change })
      .then((res) => {
        if (res.data && !showKinematicSliderMove) {
          alertContext.openSuccessAlert({ message: 'Actuator updated' });
        }
        console.log('Kinematic list', res.data);
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
      ? item.name + '0' === item.fileStore
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
        <BootstrapSelect
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
        </BootstrapSelect>
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
  }; 
  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };*/

  const handleInputChange = ({ itemId, actuator_motion_control, change }) => {
    updateMotionControlActuator(itemId, {
      ...actuator_motion_control,
      ...change
    });
  };
  const getLimit = (actuator_motion_control) => {
    const limit = actuator_motion_control.is_linear_or_rotational
      ? Number(actuator_motion_control.linear_distance_limit)
      : Number(actuator_motion_control.rotational_angle_limit);

    const actuatorlimit = actuator_motion_control.machine_actuator_limit
      ? Number(actuator_motion_control.machine_actuator_limit)
      : 0;
    if (actuatorlimit <= 0 && limit > 0) {
      return limit;
    }
    if (actuatorlimit > 0 && actuatorlimit < limit) {
      return actuatorlimit;
    }
    if (limit > 0) {
      return limit;
    }
    return actuator_motion_control.is_linear_or_rotational ? 100 : 3.14;
  };
  //console.log('After effect', itemList, kinematicItemList);
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
              <BootstrapTableCell padding="checkbox" size="small">
                Item name
              </BootstrapTableCell>
              <BootstrapTableCell padding="checkbox" size="small">
                Axis Number
              </BootstrapTableCell>
              <BootstrapTableCell padding="checkbox" size="small">
                Link applies
              </BootstrapTableCell>
              <BootstrapTableCell padding="checkbox" size="small">
                Actuator Limits
              </BootstrapTableCell>
              <BootstrapTableCell padding="checkbox" size="small">
                Machine’s Actuator Limits
              </BootstrapTableCell>
              <BootstrapTableCell padding="checkbox" size="small">
                End Effector
              </BootstrapTableCell>
              {showKinematicSliderMove && (
                <BootstrapTableCell padding="checkbox" size="small">
                  Movement
                </BootstrapTableCell>
              )}
              <BootstrapTableCell padding="checkbox" size="small">
                Chain Numbers
              </BootstrapTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itemList.map((item) => {
              const actuator_motion_control =
                item.actuator_motion_control || {};
              const actuatorDistanceAngleLimit =
                actuator_motion_control.child_part_type === 'ACTUATOR'
                  ? getLimit(item.actuator_motion_control)
                  : 0;
              //console.log('Assinging table row', selectedValue, item.id);
              return (
                <TableRow
                  style={{
                    background:
                      selectedValue === item.id
                        ? DEFAULTROWSELECTCOLOR()
                        : 'white'
                  }}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor:
                      selectedValue === item.id
                        ? DEFAULTROWSELECTCOLOR()
                        : 'white'
                  }}
                  onClick={() => {
                    if (
                      showKinematicMove ||
                      selectedValue === item.id ||
                      showKinematicSliderMove
                    ) {
                      return;
                    }
                    setSelectedValue(item.id);
                    setSelectedOption(
                      showKinematicSliderMove ? SELECTFEATURE : SELECTASSEMBLY
                    );
                    const tableData = getTableData({
                      gltfjson,
                      filePartName: itemName(item)
                    });
                    setRenderData(tableData, {
                      name: 'NoKey',
                      option: showKinematicSliderMove
                        ? SELECTFEATURE
                        : SELECTASSEMBLY
                    });
                    console.log('Clicked and Sent', tableData, item.id);
                    onClick(mykey);
                  }}
                >
                  <BootstrapTableCell
                    component="th"
                    padding="checkbox"
                    size="small"
                  >
                    <Link
                      component="button"
                      color="primary"
                      sx={{ textAlign: 'left' }}
                      onClick={(event) => handleItemNameClick(event, item.id)}
                    >
                      {itemName(item)}
                    </Link>
                  </BootstrapTableCell>
                  <BootstrapTableCell padding="checkbox" size="small">
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
                  </BootstrapTableCell>
                  <BootstrapTableCell padding="checkbox" size="small">
                    {selectedValue === item.id ? (
                      <BootstrapSelect
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
                      </BootstrapSelect>
                    ) : (
                      <>{actuator_motion_control.child_part_type}</>
                    )}
                  </BootstrapTableCell>
                  <BootstrapTableCell padding="checkbox" size="small">
                    {actuator_motion_control.child_part_type === 'ACTUATOR'
                      ? actuator_motion_control.is_linear_or_rotational
                        ? Number(
                            actuator_motion_control.linear_distance_limit
                          ).toFixed(3)
                        : Number(
                            actuator_motion_control.rotational_angle_limit
                          ).toFixed(3)
                      : ''}
                  </BootstrapTableCell>
                  {/* Machine Actuator Limit */}
                  <BootstrapTableCell padding="checkbox" size="small">
                    {selectedValue === item.id ? (
                      <CustomAutoSubmitInput
                        handleInputChange={(data) =>
                          handleInputChange({
                            itemId: item.id,
                            actuator_motion_control,
                            change: { machine_actuator_limit: data }
                          })
                        }
                      />
                    ) : (
                      <>{actuator_motion_control.machine_actuator_limit}</>
                    )}
                  </BootstrapTableCell>
                  <BootstrapTableCell padding="checkbox" size="small">
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
                      disabled={showKinematicSliderAnimate}
                    />
                  </BootstrapTableCell>
                  {showKinematicSliderMove && (
                    <BootstrapTableCell padding="checkbox" size="small">
                      {actuator_motion_control.child_part_type === 'ACTUATOR' &&
                      !actuator_motion_control.is_end_effector ? (
                        <Slider
                          aria-label="Angle"
                          min={-actuatorDistanceAngleLimit}
                          max={actuatorDistanceAngleLimit}
                          step={
                            actuatorDistanceAngleLimit >= 0.01
                              ? // ? Math.round(actuatorDistanceAngleLimit * 100) /
                                //   10000
                                actuatorDistanceAngleLimit / 100
                              : 0.01
                          }
                          value={
                            actuator_motion_control.chain_number //slider_angle
                              ? actuator_motion_control.chain_number
                              : 0
                          }
                          valueLabelDisplay={
                            showKinematicSliderAnimateValues ? 'on' : 'auto'
                          }
                          valueLabelFormat={(x) => Number(x).toFixed(2)}
                          onChange={(event, newValue) => {
                            event.stopPropagation();
                            updateMotionControlActuator(item.id, {
                              ...actuator_motion_control,
                              chain_number: newValue
                            });
                          }}
                          disabled={showKinematicSliderAnimate}
                        />
                      ) : (
                        ''
                      )}
                    </BootstrapTableCell>
                  )}

                  <BootstrapTableCell padding="checkbox" size="small">
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
                  </BootstrapTableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

const CustomAutoSubmitInput = ({ handleInputChange }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [delayedSearchTerm, setDelayedSearchTerm] = React.useState('');

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleInputChange(searchTerm);
      setDelayedSearchTerm(searchTerm);
    }, 3000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <OutlinedInput
      id="standard-basic"
      variant="standard"
      size="small"
      type="number"
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
};
