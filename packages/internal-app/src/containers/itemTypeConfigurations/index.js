import React, { useEffect, useState } from 'react';
import { LinearProgress, Box, Typography } from '@mui/material';

import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
//import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import DynamicFeedOutlinedIcon from '@mui/icons-material/DynamicFeedOutlined';
import GeometricDimensioning from '@monostruct/common/containers/GeometricDimensioningTab/GeometricDimensioningTab';
import LargeFileUpload from '@monostruct/common/gltf/LargeFileUpload';
import {
  SELECTFEATURE,
  USESTYLES,
  SELECTANITEM,
  gltf_Dict,
  getFileNameWithoutExtension,
  arrayCopy
} from '@monostruct/common/gltf/Tree/utils';
import {
  PlusMinus,
  ParameterInput,
  DisplayLabel
} from '@monostruct/common/gltf/PlusMinus';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import Headding from '@monostruct/common/components/atoms/Headding';
import DynamicHierarchyForm from './DynamicHierarchyForm';
import { get } from 'lodash';
import { handleInternalUseProduct } from '../itemDetail/ItemDetails.helper.js';
import { withStyles } from '@material-ui/core/styles';

//let state_selectedObjects = [];
let state_fileOnChange = null;
const BorderLinearProgress = withStyles((theme) => {
  return {
    root: {
      borderRadius: 30,
      width: 10,
      height: '100%'
    },
    barroot: {
      borderRadius: 30,
      width: 10,
      height: '100%'
    },
    bar: {
      borderRadius: 30,
      transform: ({ value }) => {
        return `translateY(${value}%) !important`;
      }
    }
  };
})(LinearProgress);

export default function ItemTypeConfigurations(props) {
  const {
    tabIndex,
    fileId,
    fileUUId,
    fileGDT,
    gltfjson,
    setgltfjson,
    isLoading,
    setIsLoading,
    itemProperties,
    setItemProperties,
    handleItemUpdate,
    additionalSaveFunction,
    progressBarLoad,
    percentage,
    currentProgressText,
    completionProgressText,
    centerActionText,
    drawLine,
    selectedOption,
    setSelectedOption,
    showKinematicMove,
    setShowKinematicMove,
    regenerateKinematicMove,
    setRegenerateKinematicMove,
    kinematicItemList,
    setKinematicItemList,
    handleSave,
    activeGLTFFile,
    setActiveGLTFile,
    activeGDTTable,
    setActiveGDTTable,
    drawAxisLines,
    setDrawAxisLines,
    showKinematicSliderMove,
    setShowKinematicSliderMove,
    showKinematicSliderAnimate,
    setShowKinematicSliderAnimate,
    showKinematicSliderAnimateValues,
    setShowKinematicSliderAnimateValues,
    applyTangentToEdges,
    setApplyTangentToEdges,
    xyzEndEffectorPosition,
    setXYZEndEffectorPosition,
    xyzControlPosition,
    setXYZControlPosition,
    xyzBeginPosition,
    setXYZBeginPosition,
    xyzShiftPosition,
    setXYZShiftPosition,
    kinematicParameters,
    setKinematicParameters,
    handleItemSaveOnServer
  } = props;
  const [isFileLoading, setIsFileLoading] = useState(isLoading);
  const classes = USESTYLES();
  const [percentager, setPercentager] = useState(percentage || 0);
  //const [xyzEndEffectorPosition, setXYZEndEffectorPosition] = useState({ X: 0, Y: 0, Z: 0 });
  const [progressBarLoader, setProgressBarLoader] = useState(progressBarLoad);
  const [progressAnimate, setProgressAnimate] = useState(0);
  const [progressAnimateText, setProgressAnimateText] = useState(0);
  const [currentProgressTexter, setCurrentProgressTexter] =
    useState(currentProgressText);
  const [completionProgressTexter, setCompletionProgressTexter] = useState(
    completionProgressText
  );
  const [centerActionTexter, setCenterActionTexter] =
    useState(centerActionText);
  const [drawLiner, setDrawLiner] = useState(drawLine);
  const [fileUUIder, setfileUUIder] = useState(fileUUId);

  const [showKineticModel, setShowKineticModal] = useState(true);
  const [whatchange, setWhatchange] = useState(0);
  const [internalProductConfig, setInternalProductConfig] = useState(null);
  const [isCircularFaceOrEdgeSelection, setIsCircularFaceOrEdgeSelection] =
    useState(false);
  const [isMountSurfaceFaceSelection, setIsMountSurfaceFaceSelection] =
    useState(false);
  const [isJointSurfaceFaceSelection, setIsJointSurfaceFaceSelection] = useState(false);
  useEffect(() => {
    CriteriaUploadAPI.fetchCriteriaUpload(
      `type=Internal Use Product Configuration`
    )
      .then((resp) => {
        if (get(resp, 'data[0]')) {
          setInternalProductConfig(get(resp, 'data[0]'));
        }
      })
      .catch((error) => { });
  }, []);

  useEffect(() => {
    if (fileUUId) {
      console.log('Before Changing fileUUId from IUPC', fileUUIder, fileUUId);
      setfileUUIder(fileUUId);
      console.log('After Changing fileUUId from IUPC', fileUUIder, fileUUId);
    }
  }, [fileUUId]);
  useEffect(() => {
    setProgressBarLoader(progressBarLoad);
    console.log(
      'Changing progress bar from IUPC',
      progressBarLoad,
      fileUUIder,
      fileUUId
    );
  }, [progressBarLoad]);
  useEffect(() => {
    setCurrentProgressTexter(currentProgressText);
    console.log(
      'Changing currentProgressText bar from IUPC',
      progressBarLoad,
      fileUUIder,
      fileUUId
    );
  }, [currentProgressText]);
  useEffect(() => {
    setCompletionProgressTexter(completionProgressText);
    console.log(
      'Changing completionProgressText bar from IUPC',
      progressBarLoad,
      fileUUIder,
      fileUUId
    );
  }, [completionProgressText]);
  useEffect(() => {
    setCenterActionTexter(centerActionText);
    console.log(
      'Changing centerActionText bar from IUPC',
      progressBarLoad,
      fileUUIder,
      fileUUId
    );
  }, [centerActionText]);
  useEffect(() => {
    if (percentage) {
      setPercentager(percentage);
      console.log(
        'Changing percentage from IUPC',
        percentage,
        fileUUIder,
        fileUUId
      );
    }
  }, [percentage]);

  useEffect(() => {
    setDrawLiner(drawLine);
  }, [drawLine]);

  const [fieldKey, setFieldKey] = useState({
    name: 'NoKey',
    option: SELECTFEATURE,
    selectedNodes: []
  });

  const [renderData, setRenderData] = useState([]);
  const [selected3JSData, setSelected3JSData] = useState([]);
  //const [fieldOnChange,setFieldOnChange] = useState(null); //unable to set state for the functions..

  const addSelectionFromComponent = async (
    selectedNodes,
    aFileKey,
    OnChange
  ) => {
    console.log(
      'Add Selection from Components',
      selectedNodes,
      aFileKey,
      fieldKey,
      gltfjson
    );

    setRenderData(selectedNodes);
    setWhatchange(SELECTANITEM);
    //if (aFileKey) {
    setFieldKey({ ...aFileKey, selectedNodes });
    //}

    state_fileOnChange = OnChange;
    console.log(
      'Add Selection from Components',
      selectedNodes,
      aFileKey,
      fieldKey
    );
  };

  const handleChangeOfSelection = async (mySelectedObjects) => {
    const fieldItemKey = fieldKey
      ? fieldKey.name
        ? fieldKey.name.length === 0
          ? 'fieldKey'
          : fieldKey
        : 'fieldKey'
      : 'fieldKey';
    if (state_fileOnChange) {
      console.log(
        'I am asking the component to change field via local variable',
        mySelectedObjects,
        fieldKey,
        fieldItemKey
      );
      state_fileOnChange(fieldItemKey, [...mySelectedObjects]);
    } else {
      console.log(
        'I am not asking the component to change field via local variable since file on change is null',
        mySelectedObjects,
        fieldKey,
        fieldItemKey
      );
    }
    if (handleSave) {
      console.log(
        'I am getting selected objects',
        mySelectedObjects,
        isCircularFaceOrEdgeSelection
      );
      if (
        mySelectedObjects[0] &&
        (mySelectedObjects[0].obb || mySelectedObjects[0].axis) &&
        (isCircularFaceOrEdgeSelection || isMountSurfaceFaceSelection || isJointSurfaceFaceSelection)
      ) {
        let actuator_dictionary = isCircularFaceOrEdgeSelection
          ? {
            actuator_motion_control: {
              ...(itemProperties.actuator_motion_control || {}),
              cylindrical_axis_of_rotation: {
                ...(itemProperties.actuator_motion_control
                  .cylindrical_axis_of_rotation || {}),
                axis: mySelectedObjects[0].axis,
                obb: mySelectedObjects[0].obb,
                step:
                  (fileUUIder ? fileUUIder + '/' : '') +
                  mySelectedObjects[0][gltf_Dict['step']].slice(0, -5),
                position: mySelectedObjects[0].position
                  ? mySelectedObjects[0].position
                  : [0, 0, 0]
              }
            }
          }
          : isMountSurfaceFaceSelection ? {
            actuator_motion_control: {
              ...(itemProperties.actuator_motion_control || {}),
              cylindrical_axis_of_rotation: {
                ...(itemProperties.actuator_motion_control
                  .cylindrical_axis_of_rotation || {}),
                mountaxis: mySelectedObjects[0].axis,
                mountobb: mySelectedObjects[0].obb,
                mountstep:
                  (fileUUIder ? fileUUIder + '/' : '') +
                  mySelectedObjects[0][gltf_Dict['step']].slice(0, -5),
                mountposition: mySelectedObjects[0].position
                  ? mySelectedObjects[0].position
                  : [0, 0, 0]
              }
            }
          } : {
            actuator_motion_control: {
              ...(itemProperties.actuator_motion_control || {}),
              cylindrical_axis_of_rotation: {
                ...(itemProperties.actuator_motion_control
                  .cylindrical_axis_of_rotation || {}),
                jointaxis: mySelectedObjects[0].axis,
                jointtobb: mySelectedObjects[0].obb,
                jointstep:
                  (fileUUIder ? fileUUIder + '/' : '') +
                  mySelectedObjects[0][gltf_Dict['step']].slice(0, -5),
                jointposition: mySelectedObjects[0].position
                  ? mySelectedObjects[0].position
                  : [0, 0, 0]
              }
            }
          };
        let cloneItemProperties = { ...itemProperties, ...actuator_dictionary };
        setItemProperties(cloneItemProperties);
        handleSave(
          isCircularFaceOrEdgeSelection
            ? {
              actuator_motion_control: {
                ...(itemProperties.actuator_motion_control || {}),
                cylindrical_axis_of_rotation: {
                  ...(itemProperties.actuator_motion_control
                    .cylindrical_axis_of_rotation || {}),
                  axis: mySelectedObjects[0].axis,
                  obb: mySelectedObjects[0].obb,
                  step:
                    (fileUUIder ? fileUUIder + '/' : '') +
                    mySelectedObjects[0][gltf_Dict['step']].slice(0, -5),
                  position: mySelectedObjects[0].position
                    ? mySelectedObjects[0].position
                    : [0, 0, 0]
                }
              }
            }
            : {
              actuator_motion_control: {
                ...(itemProperties.actuator_motion_control || {}),
                cylindrical_axis_of_rotation: {
                  ...(itemProperties.actuator_motion_control
                    .cylindrical_axis_of_rotation || {}),
                  mountaxis: mySelectedObjects[0].axis,
                  mountobb: mySelectedObjects[0].obb,
                  mountstep:
                    (fileUUIder ? fileUUIder + '/' : '') +
                    mySelectedObjects[0][gltf_Dict['step']].slice(0, -5),
                  mountposition: mySelectedObjects[0].position
                    ? mySelectedObjects[0].position
                    : [0, 0, 0]
                }
              }
            }
        );

        // setIsCircularFaceOrEdgeSelection(false);
      }
    } else {
      console.log(
        'I am not asking the component to set because itemupdate is null ',
        mySelectedObjects,
        fieldKey,
        fieldItemKey
      );
    }
  };

  useEffect(() => {
    setIsFileLoading(isLoading);
  }, [isLoading]);

  const handleRotationalAxisChange = () => { };

  const renderExcelUI = () => {
    return (
      <DynamicHierarchyForm
        setShowKineticModal={setShowKineticModal}
        handleItemUpdate={handleItemUpdate}
        renderData={renderData}
        setRenderData={addSelectionFromComponent}
        setSelectedOption={setSelectedOption}
        internalProductConfig={internalProductConfig}
        kinematicItemList={kinematicItemList}
        setKinematicItemList={setKinematicItemList}
        selected3JSData={selected3JSData}
        showKinematicMove={showKinematicMove}
        showKinematicSliderMove={showKinematicSliderMove}
        showKinematicSliderAnimate={showKinematicSliderAnimate}
        showKinematicSliderAnimateValues={showKinematicSliderAnimateValues}
        applyTangentToEdges={applyTangentToEdges}
        {...{
          itemProperties,
          gltfjson,
          setIsCircularFaceOrEdgeSelection,
          handleRotationalAxisChange,
          isMountSurfaceFaceSelection,
          setIsMountSurfaceFaceSelection,
          isJointSurfaceFaceSelection,
          setIsJointSurfaceFaceSelection
        }}
      />
    );
  };

  const handleSwitchChange = async (event) => {
    setShowKinematicMove(event.target.checked);
    if (event.target.checked) {
      setShowKinematicSliderMove(false);
    }
    setRegenerateKinematicMove(0);
  };

  const handleSwitchSliderChange = async (event) => {
    setShowKinematicSliderMove(event.target.checked);
    if (!event.target.checked) {
      setShowKinematicMove(false);
      setRegenerateKinematicMove(0);
    }
  };

  const handleSwitchSliderAnimate = async (event) => {
    setProgressAnimate(0);
    setProgressAnimateText('');
    setShowKinematicSliderAnimate(event.target.checked);
  };

  const handleSwitchSliderAnimateValues = async (event) => {
    setShowKinematicSliderAnimateValues(event.target.checked);
  };
  const handleSwitchTangentToEdges = async (event) => {
    setApplyTangentToEdges(event.target.checked);
  };
  const handleRegenerate = async (event) => {
    setRegenerateKinematicMove(regenerateKinematicMove + 1);
  };

  const additionalModelClick = (data) => {
    console.log('I am getting from addiitonal Model Click', data);
    setSelected3JSData(data);
  };
  const OnChangeOfPosition = (xyz, data) => {
    if (xyz === 'X') {
      // setXYZEndEffectorPosition({
      //   X: data,
      //   Y: xyzEndEffectorPosition.Y,
      //   Z: xyzEndEffectorPosition.Z
      // });
      setXYZControlPosition({
        X: data,
        Y: xyzEndEffectorPosition.Y,
        Z: xyzEndEffectorPosition.Z
      });
    }
    if (xyz === 'Y') {
      // setXYZEndEffectorPosition({
      //   X: xyzEndEffectorPosition.X,
      //   Y: data,
      //   Z: xyzEndEffectorPosition.Z
      // });
      setXYZControlPosition({
        X: xyzEndEffectorPosition.X,
        Y: data,
        Z: xyzEndEffectorPosition.Z
      });
    }
    if (xyz === 'Z') {
      // setXYZEndEffectorPosition({
      //   X: xyzEndEffectorPosition.X,
      //   Y: xyzEndEffectorPosition.Y,
      //   Z: data
      // });
      setXYZControlPosition({
        X: xyzEndEffectorPosition.X,
        Y: xyzEndEffectorPosition.Y,
        Z: data
      });
    }
    console.log('Changing End Effector', xyz, data);
  };
  const OnChangeOfParameter = (xyz, data) => {
    if (xyz === 'Step') {
      setKinematicParameters({
        step: data,
        error: kinematicParameters.error,
        iterations: kinematicParameters.iterations,
        methods: kinematicParameters.methods,
        gap: kinematicParameters.gap
      });
    }
    if (xyz === 'Error') {
      setKinematicParameters({
        step: kinematicParameters.step,
        error: data,
        iterations: kinematicParameters.iterations,
        methods: kinematicParameters.methods,
        gap: kinematicParameters.gap
      });
    }
    if (xyz === 'Iteration') {
      setKinematicParameters({
        step: kinematicParameters.step,
        error: kinematicParameters.error,
        iterations: data,
        methods: kinematicParameters.methods,
        gap: kinematicParameters.gap
      });
    }
    if (xyz === 'Method') {
      setKinematicParameters({
        step: kinematicParameters.step,
        error: kinematicParameters.error,
        iterations: kinematicParameters.iterations,
        methods: data,
        gap: kinematicParameters.gap
      });
    }
    if (xyz === 'Gap') {
      setKinematicParameters({
        step: kinematicParameters.step,
        error: kinematicParameters.error,
        iterations: kinematicParameters.iterations,
        methods: kinematicParameters.methods,
        gap: data
      });
    }
    console.log('Changing Parameter', xyz, data);
  };
  const OnChangeOfShift = (xyz, data) => {
    if (xyz === 'X') {
      setXYZShiftPosition({
        X: data,
        Y: xyzBeginPosition.Y,
        Z: xyzBeginPosition.Z
      });
    }
    if (xyz === 'Y') {
      setXYZShiftPosition({
        X: xyzBeginPosition.X,
        Y: data,
        Z: xyzBeginPosition.Z
      });
    }
    if (xyz === 'Z') {
      setXYZShiftPosition({
        X: xyzBeginPosition.X,
        Y: xyzBeginPosition.Y,
        Z: data
      });
    }
    console.log('Changing Position', xyz, data);
  };

  const handleFileUpload = async (data) => {
    setIsLoading(true);

    try {
      //const fileUploadRes = await upload3DFile(data);
      //"uuid":uuid,"filename":newfilename,"bytes":fileswritten
      const localFileId = 'Media/' + data.uuid + '/' + data.filename;
      //console.log('After File Upload', data);

      if (!data.uuid || !data.filename) {
        // eslint-disable-next-line no-throw-literal
        // console.log('File Upload Error', data);
        setIsLoading(false);
        throw { message: 'File upload error' };
      }
      let dataload = '';
      let datastore = '';
      let datagdt = '';

      dataload = data.filename;

      let filenameWithOutExtension = getFileNameWithoutExtension(dataload);
      datastore = filenameWithOutExtension + '0';
      datagdt = filenameWithOutExtension + '3';
      console.log(
        'Got files as',
        datastore,
        itemProperties.surfStore,
        dataload,
        itemProperties.surfName,
        data.uuid,
        itemProperties.fileUUId
      );

      if (
        datastore !== itemProperties.surfStore ||
        localFileId !== itemProperties.surfName ||
        data.uuid !== itemProperties.fileUUId
      ) {
        console.log('Entering to save', itemProperties, datastore, dataload);
        setItemProperties((prevData) => ({
          ...prevData,
          surfStore: datastore,
          surfName: localFileId
        }));
        handleItemSaveOnServer({
          surfStore: datastore,
          surfName: localFileId,
          surfGDT: null,
          surfKinematic: null
        });

        const myTabedIndex = 'iupc';
        const myTabIndex =
          myTabedIndex === 'iupc' &&
            !showKinematicMove &&
            !showKinematicSliderMove
            ? 'gdtac'
            : myTabedIndex;
        let item = arrayCopy(itemProperties);
        item.surfName = localFileId;
        item.surfStore = datastore;
        console.log('Entering to Parse', itemProperties, item);
        let updatedItemProp = await handleInternalUseProduct({
          item,
          myTabedIndex,
          myTabIndex,
          setIsLoading,
          setIsFileLoading,
          setProgressBarLoad: setProgressBarLoader,
          percentage: percentager,
          setPercentage: setPercentager,
          setCurrentProgressText: setCurrentProgressTexter,
          setCompletionProgressText: setCompletionProgressTexter,
          setgltfjson,
          kinematicItemList,
          showKinematicSliderMove
        });
        updatedItemProp.surfName = localFileId;
        updatedItemProp.surfStore = datastore;
        handleItemSaveOnServer(updatedItemProp);
      }
      if (activeGLTFFile !== localFileId || !localFileId) {
        console.log('Setting active gltf file to', localFileId);
        setActiveGLTFile(localFileId);
      } else {
        console.log(
          'Setting active gltf file to',
          localFileId +
          regenerateKinematicMove.toString() +
          showKinematicSliderMove.toString()
        );
        setActiveGLTFile(
          localFileId +
          regenerateKinematicMove.toString() +
          showKinematicSliderMove.toString()
        );
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsFileLoading(false);
    }
  };
  const removeFile = (data) => { };
  return (
    <>
      <Headding style={{ fontSize: 24, fontWeight: 'bold', marginLeft: 20 }}>
        {itemProperties.itemGeometry?.itemType || 'Configure Item'}
      </Headding>
      <Grid item className={classes.item_row}>
        <Typography variant="h6" noWrap>
          {'Show Kinematic Animation:'}
        </Typography>
        <Switch
          checked={showKinematicMove}
          onChange={handleSwitchChange}
          inputProps={{ 'aria-label': 'controlled' }}
        />
        {showKinematicMove && (
          <Button
            aria-describedby={'Recreate Animation'}
            id={'popfetch'}
            type="button"
            variant="contained"
            color="primary"
            onClick={handleRegenerate}
            startIcon={<DynamicFeedOutlinedIcon />}
          ></Button>
        )}
        <Typography variant="h6" noWrap>
          {'Show Kinematic Interactive Movement:'}
        </Typography>
        {!showKinematicMove && (
          <Switch
            checked={showKinematicSliderMove}
            onChange={handleSwitchSliderChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        )}
        {!showKinematicMove && showKinematicSliderMove && (
          <>
            <PlusMinus
              label={'X'}
              step={kinematicParameters.step}
              value={xyzEndEffectorPosition.X}
              onChange={(event, data) => {
                OnChangeOfPosition('X', data);
              }}
              disabled={showKinematicSliderAnimate}
            />
            &nbsp;&nbsp;
            <PlusMinus
              label={'Y'}
              step={kinematicParameters.step}
              value={xyzEndEffectorPosition.Y}
              onChange={(event, data) => {
                OnChangeOfPosition('Y', data);
              }}
              disabled={showKinematicSliderAnimate}
            />
            &nbsp;&nbsp;
            <PlusMinus
              label={'Z'}
              step={kinematicParameters.step}
              value={xyzEndEffectorPosition.Z}
              onChange={(event, data) => {
                OnChangeOfPosition('Z', data);
              }}
              disabled={showKinematicSliderAnimate}
            />
            &nbsp;&nbsp;
            <ParameterInput
              label={'Step'}
              value={kinematicParameters.step || 0.001}
              min={0.001}
              max={1000}
              step={0.0001}
              digits={4}
              onChange={(event, data) => {
                OnChangeOfParameter('Step', data);
              }}
              disabled={showKinematicSliderAnimate}
            />
            &nbsp;&nbsp;
            <ParameterInput
              label={'Precision'}
              value={kinematicParameters.error || 4}
              min={-2}
              max={100}
              step={1}
              digits={0}
              onChange={(event, data) => {
                OnChangeOfParameter('Error', data);
              }}
              disabled={showKinematicSliderAnimate}
            />
            &nbsp;&nbsp;
            <ParameterInput
              label={'Iteration'}
              value={kinematicParameters.iterations || 21}
              min={1}
              max={1000}
              step={1}
              digits={0}
              onChange={(event, data) => {
                OnChangeOfParameter('Iteration', data);
              }}
              disabled={showKinematicSliderAnimate}
            />
            &nbsp;&nbsp;
            <ParameterInput
              label={'Method'}
              value={kinematicParameters.methods || 1}
              min={1}
              max={6}
              step={1}
              digits={0}
              onChange={(event, data) => {
                OnChangeOfParameter('Method', data);
              }}
              disabled={showKinematicSliderAnimate}
            />
            <br />
            &nbsp;&nbsp;
            <ButtonGroup size="small" aria-label="small outlined button group">
              <DisplayLabel label={'Shift'} />
              &nbsp;
              <PlusMinus
                label={'X'}
                step={kinematicParameters.step}
                value={xyzBeginPosition.X}
                onChange={(event, data) => {
                  OnChangeOfShift('X', data);
                }}
                disabled={showKinematicSliderAnimate}
              />
              &nbsp;&nbsp;
              <PlusMinus
                label={'Y'}
                step={kinematicParameters.step}
                value={xyzBeginPosition.Y}
                onChange={(event, data) => {
                  OnChangeOfShift('Y', data);
                }}
                disabled={showKinematicSliderAnimate}
              />
              &nbsp;&nbsp;
              <PlusMinus
                label={'Z'}
                step={kinematicParameters.step}
                value={xyzBeginPosition.Z}
                onChange={(event, data) => {
                  OnChangeOfShift('Z', data);
                }}
                disabled={showKinematicSliderAnimate}
              />
              &nbsp;&nbsp;
              <LargeFileUpload
                handleFileUpload={handleFileUpload}
                removeFile={removeFile}
                itemProperties={itemProperties}
                setItemProperties={setItemProperties}
                datauuid={itemProperties.fileUUId}
                isFileLoading={isFileLoading}
                setIsFileLoading={setIsFileLoading}
                label={'STEP, IGES, STL, BREP'}
              />
              &nbsp;&nbsp;
              <ParameterInput
                label={'Gap'}
                value={kinematicParameters.gap || 0.001}
                min={0}
                max={1000}
                step={0.0001}
                digits={4}
                onChange={(event, data) => {
                  OnChangeOfParameter('Gap', data);
                }}
              />
              {/* <div className={classes.barroot}>
                <Box className={classes.barstats}>
                  <BorderLinearProgress
                    variant="determinate"
                    value={progressAnimate}
                  />
                </Box>
              </div> */}
              &nbsp;&nbsp;
              <div style={{ display: 'flex' }}>
                <DisplayLabel label={'Tangent To Edges:'} width={'140px'} />
                <Switch
                  checked={applyTangentToEdges}
                  onChange={handleSwitchTangentToEdges}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              </div>
              &nbsp;&nbsp;
              <Box sx={{ width: '15%' }}>
                <div style={{ position: 'relative' }}>
                  <LinearProgress
                    variant="determinate"
                    value={progressAnimate}
                    style={{ height: '30px', width: '100px' }}
                  />
                  <Typography
                    style={{
                      position: 'absolute',
                      color: 'white',
                      top: 0,
                      left: showKinematicSliderAnimate ? '70%' : '75%',
                      transform: 'translateX(-60%)'
                    }}
                  >
                    <div style={{ display: 'flex' }}>
                      <DisplayLabel
                        label={
                          showKinematicSliderAnimate
                            ? 'Stop Animate:'
                            : 'Start Animate:'
                        }
                        width={'110px'}
                      />
                      <Switch
                        checked={showKinematicSliderAnimate}
                        onChange={handleSwitchSliderAnimate}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                      <Typography
                        style={{
                          color: 'black'
                        }}
                      >
                        <DisplayLabel
                          label={progressAnimateText ? progressAnimateText : ''}
                          width={'130px'}
                        />
                      </Typography>
                    </div>
                  </Typography>
                </div>
              </Box>
              {showKinematicSliderAnimate && (
                <div style={{ display: 'flex' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <DisplayLabel
                    label={
                      showKinematicSliderAnimateValues
                        ? 'Hide Changes:'
                        : 'Show Changes:'
                    }
                    width={'120px'}
                  />
                  <Switch
                    checked={showKinematicSliderAnimateValues}
                    onChange={handleSwitchSliderAnimateValues}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                </div>
              )}
            </ButtonGroup>
          </>
        )}
      </Grid>
      {renderExcelUI()}

      <GeometricDimensioning
        fileId={fileId}
        fileGDT={fileGDT}
        fileUUId={fileUUIder}
        gltfjson={gltfjson}
        setgltfjson={setgltfjson}
        isLoading={isFileLoading}
        tabIndex={tabIndex}
        keyName={fieldKey}
        handleChangeOfSelection={handleChangeOfSelection}
        additionalSaveFunction={additionalSaveFunction}
        progressBarLoad={progressBarLoader}
        percentage={percentager}
        currentProgressText={currentProgressTexter}
        completionProgressText={completionProgressTexter}
        centerActionText={centerActionTexter}
        //setProgressBarRender={setProgressBarRender}
        setPercentage={setPercentager}
        setProgressBarLoad={setProgressBarLoader}
        setCurrentProgressText={setCurrentProgressTexter}
        setCompletionProgressText={setCompletionProgressTexter}
        setCenterActionText={setCenterActionTexter}
        drawLine={drawLiner}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        fileAnimation={true}
        changingdata={renderData}
        whatchanger={whatchange}
        showKinematicMove={showKinematicMove}
        showKinematicSliderMove={showKinematicSliderMove}
        showKinematicSliderAnimate={showKinematicSliderAnimate}
        showKinematicSliderAnimateValues={showKinematicSliderAnimateValues}
        applyTangentToEdges={applyTangentToEdges}
        regenerateKinematicMove={regenerateKinematicMove}
        additionalModelClick={additionalModelClick}
        activeGLTFFile={activeGLTFFile}
        setActiveGLTFile={setActiveGLTFile}
        activeGDTTable={activeGDTTable}
        setActiveGDTTable={setActiveGDTTable}
        drawAxisLines={drawAxisLines}
        setDrawAxisLines={setDrawAxisLines}
        kinematicItemList={kinematicItemList}
        setKinematicItemList={setKinematicItemList}
        xyzEndEffectorPosition={xyzEndEffectorPosition}
        setXYZEndEffectorPosition={setXYZEndEffectorPosition}
        xyzControlPosition={xyzControlPosition}
        setXYZControlPosition={setXYZControlPosition}
        xyzBeginPosition={xyzBeginPosition}
        setXYZBeginPosition={setXYZBeginPosition}
        xyzShiftPosition={xyzShiftPosition}
        setXYZShiftPosition={setXYZShiftPosition}
        kinematicParameters={kinematicParameters}
        setKinematicParameters={setKinematicParameters}
        itemProperties={itemProperties}
        setProgressAnimate={setProgressAnimate}
        setProgressAnimateText={setProgressAnimateText}
      //{...{ whatchange }}
      />
    </>
  );
}
