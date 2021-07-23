import React from 'react'
import GLTFRenderer from '../../../gltf/GltfRenderer';
import {    
    CircularProgress
} from "@material-ui/core";
import { DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, SELECTSOLID, SELECTHIRERACHY } from "../../../gltf/Tree/utils";
const DEFAULTMATERIALNAME = "Basic";

export default function Viewer({   gltfjson = {}, ctrlKey=false, fileGDT='', activefile = '', 
    isLoading=false, selectedOption = SELECTSOLID, splitMethod = SELECTHIRERACHY,
    handleModelClick = () => { },  setSelectedOption= () => { }, setCtrlKey= () => { }, 
    resetSelections= () => { },  selectAllSelectedSolids = () => { }     }) {
    //console.log(gltfjson);
    let gltfjsonlen =  Object.keys(gltfjson).length;
    if (gltfjsonlen > 0) {
        gltfjsonlen += gltfjson?.gltf?.accessors?.length;
    }
    //console.log("Active File",activefile, gltfjson, gltfjsonlen, isLoading);
    return (
        <>
            {
                !isLoading && (gltfjsonlen > 0) &&
                <GLTFRenderer
                    //gltfjson={JSON.stringify(gltfjson)}
                    gltfobj={gltfjson}
                    fileGDT={fileGDT}
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
                    whatchanged={0} 
                    dataselection={0}
                    onClick={handleModelClick}
                    ctrlKey={ctrlKey}
                    setSelectedOption={setSelectedOption}
                    setCtrlKey={setCtrlKey}                              
                    resetSelections={resetSelections}
                    selectAllSelectedSolids={selectAllSelectedSolids}    
                />
               
            }
            {
                isLoading  && <CircularProgress />
            }
        </>
    )
}
