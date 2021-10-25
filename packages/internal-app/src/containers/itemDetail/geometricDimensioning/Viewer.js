import React, { useState, useEffect } from 'react';
import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer';
import { /*CircularProgress,*/ Box, LinearProgress } from '@material-ui/core';
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
  }) {  
    const [percentager, setPercentager] = useState(percentage||0);
    const [progressBarLoader, setProgressBarLoader] = useState(progressBarLoad);
    const [fileUUIder, setfileUUIder] = useState(fileUUId);
    useEffect(() => {
      if(fileUUId) {
        setfileUUIder(fileUUId);
        console.log("Changing fileUUId from viewer",fileUUIder,fileUUId);
      }
    }, [fileUUId]);
    useEffect(() => {
      console.log("BEfore Changing progress bar from viewer",progressBarLoad,progressBarLoader,fileUUIder,fileUUId);
      setProgressBarLoader(progressBarLoad);
      console.log("AFter Changing progress bar from viewer",progressBarLoad,progressBarLoader,fileUUIder,fileUUId);
    }, [progressBarLoad]);
    
    useEffect(() => {
      if(percentage) {
        console.log("Before Changing percentage from viewer",percentage,percentager,fileUUIder,fileUUId);
        setPercentager(percentage);
        console.log("After Changing percentage from viewer",percentage,percentager,fileUUIder,fileUUId);
      }
    }, [percentage]);
    let gltfjsonlen = Object.keys(gltfjson).length;
    if (gltfjsonlen > 0) {
      gltfjsonlen += gltfjson?.gltf?.accessors?.length;
    }
    let changedata = {};
    if (renderdata) {
      console.log(renderdata);
      changedata = renderdata;
    }
    
    return (
      <>
        {progressBarLoader && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress variant="determinate"  value={percentager.toFixed(3)} />
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
          /*  openSnackBar={openSnackBar}
            closeSnackBar={closeSnackBar} */
          />
        )}
        {/* {isLoading && <CircularProgress />} */}
      </>
    );
}
