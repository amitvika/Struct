import React, { useEffect, useState } from 'react';
import { Paper, CircularProgress } from '@material-ui/core';
import GeometricDimensioning from '../itemDetail/geometricDimensioning';
import {
  // SELECTBACKCOLOR,
  // SELECTSELECTCOLOR,
  // SELECTTOUCHCOLOR,
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  // getTexture,
  // SELECT2DTEXTURE,
  // SELECT3DTEXTURE,
  // SELECTMATERIRAL,
  SELECTDISTANCE,
  // SELECTSHOWINFO,
  SELECTSOLID,
  // SELECTFACE,
  // SELECTEDGE,
  // SELECTCORNER,
  // SELECTMEASURE,
  // SELECTCONTINOUS,
  SELECTHIRERACHY,
  SELECTDISECTPARTS,
  // SELECTSTACKABLE,
  // SELECTORDER,
  SELECTASSEMBLY,
  SELECTFEATURE,
  // prettyPrintArray,
  arrayCopy, 
  arrayFindIndex, 
  arrayRemove, 
  gltf_Dict,
  STATEPROPS,
  USESTYLES
} from '@monostruct/common/gltf/Tree/utils';

import Headding from '@monostruct/common/components/atoms/Headding';

import DynamicHierarchy from './DynamicHierarchy';


import LoadingModal from '@monostruct/common/components/LoadingModal';

//let state_selectedObjects = [];
let state_fileOnChange = null;

export default function ItemTypeConfiguration(props) {
  const { tabIndex, fileId, gltfjson, isLoading, itemProperties, handleItemUpdate, additionalSaveFunction } =
    props;
  //const [list, setList] = useState([]);
  const [isFileLoading, setIsLoading] = useState(isLoading);
  const [firstTimeLoading, setFirstTimeLoading] = useState(false);
  //const [filteredList, setFilteredList] = useState([]);
  const [selectedOption, setSelectedOption] = useState(SELECTFEATURE);
  const [resetOption, setResetOption] = useState(true);
  const classes = USESTYLES();

  
  const [fieldKey,setFieldKey] = useState({name:"NoKey",option:SELECTFEATURE});
  const [renderData,setRenderData] = useState([]);
  //const [fieldOnChange,setFieldOnChange] = useState(null); //unable to set state for the functions..

  const addSelectionFromComponent = async (selectedNodes,aFileKey,OnChange) => {
    console.log("Add Selection from Components",selectedNodes,aFileKey,fieldKey);
    setRenderData(selectedNodes);
    setFieldKey(aFileKey);   
    state_fileOnChange = OnChange;
    console.log("Add Selection from Components",selectedNodes,aFileKey,fieldKey);
  
  };

  const handleChangeOfSelection = async (mySelectedObjects) => {
    const fieldItemKey = fieldKey ? fieldKey.name? fieldKey.name.length==0? 'fieldKey':fieldKey : 'fieldKey' : 'fieldKey';
    if(handleItemUpdate) {    
      console.log("I am asking the component to set",mySelectedObjects, fieldKey,fieldItemKey);
      handleItemUpdate({[fieldItemKey]: [...mySelectedObjects]});
    } else {
      console.log("I am not asking the component to set because itemupdate is null ",mySelectedObjects, fieldKey,fieldItemKey);
    }
    if(state_fileOnChange) {
      console.log("I am asking the component to change field via local variable",mySelectedObjects, fieldKey,fieldItemKey);
      state_fileOnChange(fieldItemKey,[...mySelectedObjects]);
    } else {
      console.log("I am not asking the component to change field via local variable since file on change is null",mySelectedObjects, fieldKey,fieldItemKey);
    }
  }

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading]);
  const [showKineticModel, setShowKineticModal] = useState(true);
  const renderExcelUI = () => {
    //console.log("RENDEREXCELUI",addSelectionFromComponent,"SHOW",setShowKineticModal,"UPDATE",handleItemUpdate,"RENDER",state.renderdata);
    if (
      itemProperties.itemGeometry?.itemType ===
      'Machine - Compound/Tool/Workholding'
    ) {
      return (
        <DynamicHierarchy
          setShowKineticModal={setShowKineticModal}
          handleItemUpdate={handleItemUpdate}
          renderData={renderData}
          setRenderData={addSelectionFromComponent}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <>
      <Headding style={{ fontSize: 24, fontWeight: 'bold', marginLeft: 20 }}>
        {itemProperties.itemGeometry?.itemType || 'Configure Item'}
      </Headding>
      <LoadingModal isLoading={isLoading} />
      {renderExcelUI()}
      {!isLoading && (
        <Paper className={classes.mainContainer}>
          <Paper className={classes.viewerContainer}>
            {!isLoading &&
              Object.keys(gltfjson).length > 0 &&
              !isFileLoading && (
                <GeometricDimensioning
                  fileId={fileId || ''}
                  fileGDT={itemProperties.fileGDT}
                  gltfjson={gltfjson}
                  isLoading={isLoading}                
                  tabIndex={tabIndex}
                  keyName={fieldKey}  
                  handleChangeOfSelection={handleChangeOfSelection}   
                  additionalSaveFunction={additionalSaveFunction}           
                />
              )}
            {(isLoading || isFileLoading) && <CircularProgress />}
          </Paper>
         
        </Paper>
      )}
    </>
  );
}
