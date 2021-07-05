import React from 'react'
import GLTFRenderer from '../../../gltf/GltfRenderer';
import {    
    CircularProgress
} from "@material-ui/core";
import { DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, SELECTSOLID, SELECTHIRERACHY } from "../../../gltf/Tree/utils";
const DEFAULTMATERIALNAME = "Basic";

export default function Viewer({ gltfjson = {}, activefile = '', isLoading=false, selectedOption = SELECTSOLID, splitMethod = SELECTHIRERACHY,
    handleModelClick = () => { } }) {
    //console.log(gltfjson);
    let gltfjsonlen =  Object.keys(gltfjson).length;
    if (gltfjsonlen > 0) {
        gltfjsonlen += gltfjson?.tree?.length;
    }
    //console.log("Active File",activefile, gltfjson, gltfjsonlen, isLoading);
    return (
        <div>
            {
                !isLoading && (gltfjsonlen > 0) &&
                <GLTFRenderer
                    //gltfjson={JSON.stringify(gltfjson)}
                    gltfobj={gltfjson}
                    activefile={activefile+gltfjsonlen.toString()}
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
            {
                isLoading  && <CircularProgress />
            }
        </div>
    )
}
