import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import DynamicFeedOutlinedIcon from '@mui/icons-material/DynamicFeedOutlined';
import GeometricDimensioning from '@monostruct/common/containers/GeometricDimensioningTab/GeometricDimensioningTab';
import {
  SELECTFEATURE,
  USESTYLES,
  SELECTANITEM,
  gltf_Dict
} from '@monostruct/common/gltf/Tree/utils';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import Headding from '@monostruct/common/components/atoms/Headding';
import DynamicHierarchyForm from './DynamicHierarchyForm';
import { get } from 'lodash';

//let state_selectedObjects = [];
let state_fileOnChange = null;

export default function ItemTypeConfigurations(props) {
  const {
    tabIndex,
    fileId,
    fileUUId,
    fileGDT,
    gltfjson,
    setgltfjson,
    isLoading,
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
    setShowKinematicSliderMove
  } = props;
  const [isFileLoading, setIsFileLoading] = useState(isLoading);
  const classes = USESTYLES();
  const [percentager, setPercentager] = useState(percentage || 0);
  const [progressBarLoader, setProgressBarLoader] = useState(progressBarLoad);
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

  useEffect(() => {
    CriteriaUploadAPI.fetchCriteriaUpload(
      `type=Internal Use Product Configuration`
    )
      .then((resp) => {
        if (get(resp, 'data[0]')) {
          setInternalProductConfig(get(resp, 'data[0]'));
        }
      })
      .catch((error) => {});
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
        ? fieldKey.name.length == 0
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
        isCircularFaceOrEdgeSelection
      ) {
        let actuator_dictionary = {
          actuator_motion_control: {
            ...(itemProperties.actuator_motion_control || {}),
            cylindrical_axis_of_rotation: {
              axis: mySelectedObjects[0].axis,
              obb: mySelectedObjects[0].obb,
              step:
                (fileUUIder ? fileUUIder + '/' : '') +
                mySelectedObjects[0][gltf_Dict['step']].slice(0, -5)
            }
          }
        };
        let cloneItemProperties = { ...itemProperties, ...actuator_dictionary };
        setItemProperties(cloneItemProperties);
        handleSave({
          actuator_motion_control: {
            ...(itemProperties.actuator_motion_control || {}),
            cylindrical_axis_of_rotation: {
              axis: mySelectedObjects[0].axis,
              obb: mySelectedObjects[0].obb,
              step:
                (fileUUIder ? fileUUIder + '/' : '') +
                mySelectedObjects[0][gltf_Dict['step']].slice(0, -5)
            }
          }
        });

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

  const handleRotationalAxisChange = () => {};

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
        {...{
          itemProperties,
          gltfjson,
          setIsCircularFaceOrEdgeSelection,
          handleRotationalAxisChange
        }}
      />
    );
  };

  const handleSwitchChange = async (event) => {
    setShowKinematicMove(event.target.checked);
    setRegenerateKinematicMove(0);
  };

  const handleSwitchSliderChange = async (event) => {
    setShowKinematicSliderMove(event.target.checked);
  };

  const handleRegenerate = async (event) => {
    setRegenerateKinematicMove(regenerateKinematicMove + 1);
  };

  const additionalModelClick = (data) => {
    console.log('I am getting from addiitonal Model Click', data);
    setSelected3JSData(data);
  };
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
          {'Show Kinematic Slider Animation:'}
        </Typography>
        {!showKinematicMove && (
          <Switch
            checked={showKinematicSliderMove}
            onChange={handleSwitchSliderChange}
            inputProps={{ 'aria-label': 'controlled' }}
          />
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
        regenerateKinematicMove={regenerateKinematicMove}
        additionalModelClick={additionalModelClick}
        activeGLTFFile={activeGLTFFile}
        setActiveGLTFile={setActiveGLTFile}
        activeGDTTable={activeGDTTable}
        setActiveGDTTable={setActiveGDTTable}
        drawAxisLines={drawAxisLines}
        setDrawAxisLines={setDrawAxisLines}
        //{...{ whatchange }}
      />
    </>
  );
}
