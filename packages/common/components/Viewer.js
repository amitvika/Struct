import React from 'react'
import GLTFRenderer from '../gltf/GltfRenderer'
import { DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, SELECTSOLID, SELECTHIRERACHY } from "../gltf/Tree/utils";
const DEFAULTMATERIALNAME = "Basic";

export default function Viewer({ gltfjson = {}, fileId = '', fileGDT = '', selectedOption = SELECTSOLID, splitMethod = SELECTHIRERACHY,
  handleModelClick = () => { } }) {
  return (
    <div>
      {
        // Object.keys(gltfjson).length > 0 &&
        <GLTFRenderer
          //gltfjson={JSON.stringify(gltfjson)}
          gltfobj={gltfjson}
          activefile={fileId}
          fileGDT={fileGDT}
          backcolor={DEFAULTBACKCOLOR}
          selectcolor={DEFAULTSELECTCOLOR}
          touchcolor={DEFAULTTOUCHCOLOR}
          selectedoption={selectedOption}
          splitmethod={splitMethod}
          changedata={[]}
          data2texture={null}
          data3texture={null}
          materialtype={DEFAULTMATERIALNAME}
          whatchanged={0} dataselection={0}
          onClick={handleModelClick}
        />
      }
    </div>
  )
}
