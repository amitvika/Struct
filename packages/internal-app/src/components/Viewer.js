import React, {useState, useEffect} from 'react';
import { Box /*, LinearProgress*/ } from '@mui/material';
// import GLTFRenderer from '../../../gltf/GltfRenderer';
import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer';
import {
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  SELECTSOLID,
  SELECTHIRERACHY,
  STATEPROPS
} from '@monostruct/common/gltf/Tree/utils';
//const DEFAULTMATERIALNAME = 'Basic';
import LinearProgressBarTiming from '@monostruct/common/gltf/LinearProgressBarTiming';

export default function Viewer({
  gltfjson = {},
  fileId = '',
  fileUUId = null,
  fileGDT = '',
  selectedOption = SELECTSOLID,
  splitMethod = SELECTHIRERACHY,
  handleModelClick = () => {},
  progressBarLoad=false,
  percentage=0,
  currentProgressText=null,
  completionProgressText=null,
  centerActionText=null,
  drawLine=false,
  }) {
    const [percentager, setPercentager] = useState(percentage || 0);
    const [progressBarLoader, setProgressBarLoader] = useState(progressBarLoad);  
    const [currentProgressTexter,setCurrentProgressTexter]=useState(currentProgressText);
    const [completionProgressTexter,setCompletionProgressTexter]=useState(completionProgressText);
    const [centerActionTexter,setCenterActionTexter]=useState(centerActionText);
    const [progressBarRender, setProgressBarRender] = useState(false); 
    const [drawLiner,setDrawLiner]=useState(drawLine);

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
      //console.log('Setting itemProperties', itemProperties);
      setDrawLiner(drawLine);   
    }, [drawLine]);
  return (
    <div>
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
      {
        // Object.keys(gltfjson).length > 0 &&
        <GLTFRenderer
          //gltfjson={JSON.stringify(gltfjson)}
          gltfobj={gltfjson}
          activefile={fileId}
          fileUUId={fileUUId}
          fileGDT={fileGDT}
          fileAnimation={false}
          backcolor={DEFAULTBACKCOLOR()}
          selectcolor={DEFAULTSELECTCOLOR()}
          touchcolor={DEFAULTTOUCHCOLOR()}
          selectedoption={selectedOption}
          splitmethod={splitMethod}
          changedata={[]}
          data2texture={null}
          data3texture={null}
          materialtype={STATEPROPS.materialname}
          whatchanged={0}
          dataselection={0}
          onClick={handleModelClick}
          activeDataTable={0}
          setProgressBarRender={setProgressBarRender}
          setPercentage={setPercentager}
          setProgressBarLoad={setProgressBarLoader}
          setCurrentProgressText={setCurrentProgressTexter}
          setCompletionProgressText={setCompletionProgressTexter}
          setCenterActionText={setCenterActionTexter}
          drawLine={drawLiner}
          edgecolor={STATEPROPS.edgecolor}
        />
      }
    </div>
  );
}
