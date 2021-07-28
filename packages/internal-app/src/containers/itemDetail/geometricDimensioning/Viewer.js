import React from 'react'
import GLTFRenderer from '../../../gltf/GltfRenderer';
import {    
    CircularProgress
} from "@material-ui/core";
import { DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, SELECTSOLID, SELECTHIRERACHY, SELECTDISTANCE } from "../../../gltf/Tree/utils";
const DEFAULTMATERIALNAME = "Basic";

export default function Viewer({   gltfjson = {}, ctrlKey=false, fileGDT='', activefile = '', 
    isLoading=false, renderdata={}, whatchange=0, selectedOption = SELECTSOLID, splitMethod = SELECTHIRERACHY,
    handleModelClick = () => { },  setSelectedOption= () => { }, setCtrlKey= () => { }, 
    resetSelections= () => { },  selectAllSelectedSolids = () => { } , resetSelectionFromTree = () => {}   }) {
    //console.log(gltfjson);
    let gltfjsonlen =  Object.keys(gltfjson).length;
    if (gltfjsonlen > 0) {
        gltfjsonlen += gltfjson?.gltf?.accessors?.length;
    }
    let changedata = {};
    if(renderdata) {
        console.log(renderdata);
        changedata=renderdata;
    }
    console.log("Active File",activefile,"RenderB", renderdata, "RenderA", gltfjson, gltfjsonlen, isLoading);
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
                    changedata={changedata}
                    data2texture={null}
                    data3texture={null}
                    materialtype={DEFAULTMATERIALNAME}
                    whatchanged={whatchange} 
                    dataselection={0}
                    onClick={handleModelClick}
                    ctrlKey={ctrlKey}
                    setSelectedOption={setSelectedOption}
                    setCtrlKey={setCtrlKey}                              
                    resetSelections={resetSelections}
                    selectAllSelectedSolids={selectAllSelectedSolids}   
                    resetSelectionFromTree={resetSelectionFromTree} 
                />
               
            }
            {
                isLoading  && <CircularProgress />
            }
        </>
    )
}
