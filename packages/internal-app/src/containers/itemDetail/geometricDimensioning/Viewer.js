import React from 'react';
import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer';
import { CircularProgress } from '@material-ui/core';
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
  /* openSnackBar=(value)=>{console.log("Open Snack bar", value);},
  closeSnackBar=(value)=>{console.log("Close Snack bar", value);} */
}) {
  //console.log(gltfjson);
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
      {!isLoading && gltfjsonlen > 0 && (
        <GLTFRenderer
          //gltfjson={JSON.stringify(gltfjson)}
          gltfobj={gltfjson}
          fileGDT={fileGDT}
          fileAnimation={false}
          activefile={activefile + gltfjsonlen.toString()}
          backcolor={DEFAULTBACKCOLOR}
          selectcolor={DEFAULTSELECTCOLOR}
          touchcolor={DEFAULTTOUCHCOLOR}
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
      {isLoading && <CircularProgress />}
    </>
  );
}
