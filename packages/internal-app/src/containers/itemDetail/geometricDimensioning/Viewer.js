import React, { useState, useEffect } from 'react';
import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer';
import { /*CircularProgress,*/ Box /*, LinearProgress*/ } from '@material-ui/core';
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
  setIsProgressOpen=(value)=>{console.log("Set Is Progress Open",value);},
  setProgressOpenedFiles=(value)=>{console.log("Set Progres sOpened Files",value);},
  progressBarLoad=false,
  percentage=0,
  currentProgressText=null,
  completionProgressText=null,
  centerActionText=null,
  drawLine=false,
  }) {  
    const [percentager, setPercentager] = useState(percentage||0);
    const [progressBarLoader, setProgressBarLoader] = useState(progressBarLoad);
    const [currentProgressTexter, setCurrentProgressTexter] = useState(currentProgressText);
    const [completionProgressTexter, setCompletionProgressTexter] = useState(completionProgressText);
    const [centerActionTexter, setCenterActionTexter] = useState(centerActionText);
    const [fileUUIder, setfileUUIder] = useState(fileUUId);
    const [progressBarRender, setProgressBarRender] = useState(false); 
    const [drawLiner, setDrawLiner]=useState(drawLine);
    useEffect(() => {
      if(fileUUId) {
        setfileUUIder(fileUUId);
      }
    }, [fileUUId]);
    
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
      if(percentage) {
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
        {(progressBarLoader||progressBarRender) && (
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
        {!isLoading && gltfjsonlen > 0 && (
          <GLTFRenderer
            //gltfjson={JSON.stringify(gltfjson)}
            gltfobj={gltfjson}
            fileGDT={fileGDT}
            fileUUId={fileUUIder}
            fileAnimation={false}
            activefile={activefile + gltfjsonlen.toString()}
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
          /*  openSnackBar={openSnackBar}
            closeSnackBar={closeSnackBar} */
          />
        )}
        {/* {isLoading && <CircularProgress />} */}
      </>
    );
}
