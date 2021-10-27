import React from 'react';
import { Box /*, LinearProgress*/ } from '@material-ui/core';
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
  completionProgressText=null
  }) {
  return (
    <div>
      {progressBarLoad && (
        <Box sx={{ width: '100%' }}>
          <LinearProgressBarTiming 
             value={percentage}
             currentProgressText={currentProgressText}
             completionProgressText={completionProgressText}
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
        />
      }
    </div>
  );
}
