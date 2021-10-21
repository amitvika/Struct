import React from 'react'
import { Box, LinearProgress } from '@material-ui/core';

import GLTFRenderer from '../gltf/GltfRenderer'
import { DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, SELECTSOLID, SELECTHIRERACHY, STATEPROPS } from "../gltf/Tree/utils";
//const DEFAULTMATERIALNAME = "Basic";

export default function Viewer({ gltfjson = {}, 
  fileId = '', 
  fileUUId=null, 
  fileGDT = '', 
  selectedOption = SELECTSOLID, 
  splitMethod = SELECTHIRERACHY,
  handleModelClick = () => { },
  progressBarLoad=false,
  percentage=0,
  }) {
  return (
    <div>
      {progressBarLoad && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress variant="determinate"  value={percentage.toFixed(3)} />
        </Box>
      )}
      {       
        // Object.keys(gltfjson).length > 0 &&
        <GLTFRenderer
          //gltfjson={JSON.stringify(gltfjson)}
          gltfobj={gltfjson}
          activefile={fileId}
          fileGDT={fileGDT}
          fileUUId={fileUUId}
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
          whatchanged={0} dataselection={0}
          onClick={handleModelClick}
          activeDataTable={0}
        />
      }
    </div>
  )
}
