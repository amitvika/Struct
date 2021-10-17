import React from 'react';
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

export default function Viewer({
  gltfjson = {},
  fileId = '',
  fileGDT = '',
  selectedOption = SELECTSOLID,
  splitMethod = SELECTHIRERACHY,
  handleModelClick = () => {},
}) {
  return (
    <div>
      {
        // Object.keys(gltfjson).length > 0 &&
        <GLTFRenderer
          //gltfjson={JSON.stringify(gltfjson)}
          gltfobj={gltfjson}
          activefile={fileId}
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
