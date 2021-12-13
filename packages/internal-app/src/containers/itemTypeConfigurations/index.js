import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import GeometricDimensioning from '../itemDetail/geometricDimensioning';
import { SELECTFEATURE, USESTYLES } from '@monostruct/common/gltf/Tree/utils';

import Headding from '@monostruct/common/components/atoms/Headding';

import DynamicHierarchyForm from './DynamicHierarchyForm';
import { drop } from 'lodash';
import MotionControlComponent from '../MotionControlComponent';

//let state_selectedObjects = [];
let state_fileOnChange = null;

export default function ItemTypeConfiguration(props) {
  const {
    tabIndex,
    fileId,
    fileUUId,
    fileGDT,
    gltfjson,
    isLoading,
    itemProperties,
    handleItemUpdate,
    additionalSaveFunction,
    progressBarLoad,
    percentage,
    currentProgressText,
    completionProgressText,
    centerActionText,
    drawLine,
    internalProductConfig,
    selectedOption,
    setSelectedOption,
    showKinematicMove,
    setShowKinematicMove
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
    option: SELECTFEATURE
  });
  const [renderData, setRenderData] = useState([]);
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
      fieldKey
    );
    setRenderData(selectedNodes);
    setFieldKey(aFileKey);
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
    if (handleItemUpdate) {
      console.log(
        'I am asking the component to set',
        mySelectedObjects,
        fieldKey,
        fieldItemKey
      );
      handleItemUpdate({ [fieldItemKey]: [...mySelectedObjects] });
    } else {
      console.log(
        'I am not asking the component to set because itemupdate is null ',
        mySelectedObjects,
        fieldKey,
        fieldItemKey
      );
    }
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
  };

  useEffect(() => {
    setIsFileLoading(isLoading);
  }, [isLoading]);

  const renderExcelUI = () => {
    // if (
    //   itemProperties.itemGeometry?.itemType ===
    //   'Machine - Compound/Tool/Workholding'
    // ) {
    return (
      <DynamicHierarchyForm
        setShowKineticModal={setShowKineticModal}
        handleItemUpdate={handleItemUpdate}
        renderData={renderData}
        setRenderData={addSelectionFromComponent}
        internalProductConfig={internalProductConfig}
      />
    );
    //   } else {
    //     return null;
    //   }
  };
  const handleSwitchChange = async (event) => {
    setShowKinematicMove(event.target.checked);
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
      </Grid>
      {renderExcelUI()}
      <MotionControlComponent />
      <GeometricDimensioning
        fileId={fileId}
        fileGDT={fileGDT}
        fileUUId={fileUUIder}
        gltfjson={gltfjson}
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
      />
    </>
  );
}
