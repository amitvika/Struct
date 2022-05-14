import React, { useState, useEffect } from 'react';
import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer';
import { /*CircularProgress,*/ Box /*, LinearProgress*/ } from '@mui/material';
import {
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  //SELECTSOLID,
  SELECTHIRERACHY,
  //SELECTDISTANCE,
  SELECTFEATURE,
  STATEPROPS
} from '@monostruct/common/gltf/Tree/utils';
//const DEFAULTMATERIALNAME = 'Basic';
import LinearProgressBarTiming from '@monostruct/common/gltf/LinearProgressBarTiming';

export default function Viewer({
  gltfjson = {},
  ctrlKey = false,
  fileGDT = '',
  fileUUId = null,
  activefile = '',
  isLoading = false,
  renderdata = {},
  whatchange = 0,
  selectedOption = SELECTFEATURE,
  splitMethod = SELECTHIRERACHY,
  handleModelClick = () => {},
  setSelectedOption = () => {},
  setCtrlKey = () => {},
  resetSelections = () => {},
  selectAllSelectedSolids = () => {},
  resetSelectionFromTree = () => {},
  setStateOfTree = () => {},
  setStateOfgltf = () => {},
  activeDataTable = 0,
  setIsProgressOpen = (value) => {
    console.log('Set Is Progress Open', value);
  },
  setProgressOpenedFiles = (value) => {
    console.log('Set Progres sOpened Files', value);
  },
  progressBarLoad = false,
  percentage = 0,
  currentProgressText = null,
  completionProgressText = null,
  centerActionText = null,
  drawLine = false,
  fileAnimation = false,
  tabIndex = '',
  showKinematicMove = false,
  regenerateKinematicMove = 0,
  activeGLTFFile = '',
  setActiveGLTFile = () => {},
  drawAxisLines = null,
  showKinematicSliderMove = false,
  showKinematicSliderAnimate = false,
  kinematicItemList = [],
  setKinematicItemList = () => {},
  xyzEndEffectorPosition = { X: 0, Y: 0, Z: 0 },
  setXYZEndEffectorPosition = () => {},
  xyzControlPosition = { X: 0, Y: 0, Z: 0 },
  setXYZControlPosition = () => {},
  xyzBeginPosition = { X: 0, Y: 0, Z: 0 },
  setXYZBeginPosition = () => {},
  xyzShiftPosition = { X: 0, Y: 0, Z: 0 },
  setXYZShiftPosition = () => {},
  kinematicParameters = {
    step: 1,
    error: 4,
    iterations: 21,
    methods: 1,
    gap: 0.001
  },
  setKinematicParameters = null,
  itemProperties = null,
  setProgressAnimate = null,
  setProgressAnimateText = null
}) {
  const [percentager, setPercentager] = useState(percentage || 0);
  const [progressBarLoader, setProgressBarLoader] = useState(progressBarLoad);
  const [currentProgressTexter, setCurrentProgressTexter] =
    useState(currentProgressText);
  const [completionProgressTexter, setCompletionProgressTexter] = useState(
    completionProgressText
  );
  const [centerActionTexter, setCenterActionTexter] =
    useState(centerActionText);
  const [fileUUIder, setfileUUIder] = useState(fileUUId);
  const [progressBarRender, setProgressBarRender] = useState(false);
  const [drawLiner, setDrawLiner] = useState(drawLine);
  useEffect(() => {
    if (fileUUId) {
      setfileUUIder(fileUUId);
    }
  }, [fileUUId]);
  // useEffect(() => {
  //   if (gltfjson) {
  //     console.log('I got a change in gltfjson in viewer', gltfjson);
  //   }
  // }, [gltfjson]);
  useEffect(() => {
    setProgressBarLoader(progressBarLoad);
  }, [progressBarLoad]);

  useEffect(() => {
    setCurrentProgressTexter(currentProgressText);
  }, [currentProgressText]);

  useEffect(() => {
    setCompletionProgressTexter(completionProgressText);
  }, [completionProgressText]);

  useEffect(() => {
    setCenterActionTexter(centerActionText);
  }, [centerActionText]);

  useEffect(() => {
    if (percentage) {
      setPercentager(percentage);
    }
  }, [percentage]);

  useEffect(() => {
    setDrawLiner(drawLine);
  }, [drawLine]);
  let gltfjsonlen = Object.keys(gltfjson).length;
  if (gltfjsonlen > 0) {
    gltfjsonlen += gltfjson?.gltf?.accessors?.length;
  }
  let changedata = {};
  if (renderdata) {
    changedata = renderdata;
  }

  return (
    <>
      {(progressBarLoader || progressBarRender) && (
        <Box sx={{ width: '100%' }}>
          <LinearProgressBarTiming
            value={percentager}
            currentProgressText={currentProgressTexter}
            completionProgressText={completionProgressTexter}
            centerActionText={centerActionTexter}
            progressBarRender={progressBarRender}
          />
        </Box>
      )}
      {
        /*!isLoading && gltfjsonlen > 0 &&*/ <GLTFRenderer
          //gltfjson={JSON.stringify(gltfjson)}
          gltfobj={gltfjson}
          fileGDT={fileGDT}
          fileUUId={fileUUIder}
          activefile={
            activefile +
            //(showKinematicMove ? '' : gltfjsonlen.toString()) +
            tabIndex.toString() +
            showKinematicMove.toString() +
            regenerateKinematicMove.toString() +
            showKinematicSliderMove.toString()
          }
          backcolor={DEFAULTBACKCOLOR()}
          selectcolor={DEFAULTSELECTCOLOR()}
          touchcolor={DEFAULTTOUCHCOLOR()}
          selectedoption={selectedOption}
          splitmethod={splitMethod}
          changedata={changedata}
          data2texture={null}
          data3texture={null}
          materialtype={STATEPROPS.materialname}
          whatchanged={whatchange}
          dataselection={0}
          onClick={handleModelClick}
          ctrlKey={ctrlKey}
          setSelectedOption={setSelectedOption}
          setCtrlKey={setCtrlKey}
          resetSelections={resetSelections}
          selectAllSelectedSolids={selectAllSelectedSolids}
          resetSelectionFromTree={resetSelectionFromTree}
          setStateOfTree={setStateOfTree}
          setStateOfgltf={setStateOfgltf}
          activeDataTable={activeDataTable}
          setIsProgressOpen={setIsProgressOpen}
          setProgressOpenedFiles={setProgressOpenedFiles}
          setProgressBarRender={setProgressBarRender}
          setPercentage={setPercentager}
          setProgressBarLoad={setProgressBarLoader}
          setCurrentProgressText={setCurrentProgressTexter}
          setCompletionProgressText={setCompletionProgressTexter}
          setCenterActionText={setCenterActionTexter}
          drawLine={drawLiner}
          edgecolor={STATEPROPS.edgecolor}
          fileAnimation={fileAnimation}
          activeGLTFFile={
            activeGLTFFile +
            tabIndex.toString() +
            showKinematicMove.toString() +
            regenerateKinematicMove.toString() +
            showKinematicSliderMove.toString()
          }
          setActiveGLTFile={setActiveGLTFile}
          drawAxisLines={drawAxisLines}
          showKinematicMove={showKinematicMove}
          showKinematicSliderMove={showKinematicSliderMove}
          showKinematicSliderAnimate={showKinematicSliderAnimate}
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
          /*  openSnackBar={openSnackBar}
            closeSnackBar={closeSnackBar} */
        />
      }
      {/* {isLoading && <CircularProgress />} */}
    </>
  );
}
