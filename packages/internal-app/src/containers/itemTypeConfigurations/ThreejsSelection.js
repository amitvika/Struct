import React from 'react'
import {
  
  SELECTSOLID,
  // SELECTFACE,
  SELECTEDGE,
  // SELECTCORNER,
  // SELECTASSEMBLY,
  // SELECTFEATURE,
  // prettyPrintArray,
  //arrayCopy, 
  //arrayFindIndex, 
  //arrayRemove, 
  gltf_Dict,
  //STATEPROPS,
  //USESTYLES
} from '@monostruct/common/gltf/Tree/utils';
import Button from '@material-ui/core/Button';

//import { NavigateBeforeSharp } from '@material-ui/icons'
export default function ThreejsSelection(props) {
  const { renderData,
          setRenderData,
          value,  
          mykey,
          active, 
          onChange,
          onClick } = props;
  const myvalue = value ? value: ["No Data Selected"];
  console.log("THRESSJSC",renderData,value,mykey);
  
  const getMyName = (item) => {
    let myelement = item[gltf_Dict['element']];
      let myName = item[gltf_Dict['name']];
      let first4chars = myName.slice(0, 4);
      let first6chars = myName.slice(0, 6);
      if (myelement) {
        first4chars = myelement;
        first6chars = myelement;
        if (myelement == "F") {
          first4chars = "FACE";
        } else if (myelement == "E") {
          first4chars = "EDGE";
        } else if (myelement == "V") {
          first6chars = "VERTEX";
        } else if (myelement == "P") {
          first4chars = "PART";
        } else if ((myelement == "f") || (myelement == "e") || (myelement == "v")) {
          first6chars = "SLICER";
        }
      }
      if ((mykey=="Rotary Output Component") && (first4chars=="PART") ) {
        return myName+"\u2003";
      } else if ( (mykey!="Rotary Output Component") && (first4chars=="EDGE") ) {
        return myName+"\u2003";
      } else {
        return "\u0020";
      }
  }
  return (
    <Button
        aria-describedby={'Save Controls'}
        id={'popselect'}
        type="button"
        variant="contained"
        color={active?"primary":"default"}
        onClick={(event) => {                 
          console.log("THRESSJSOC",renderData,"VALUE",value,"KEY",mykey);
          setRenderData(value,
            {name:mykey,
              option:mykey=="Rotary Output Component"?
              SELECTSOLID:SELECTEDGE},
            onChange);
          onClick(mykey);               
        }}
      >
      {/* <div style={{background:active?"#A0A0A0":"#D0D0D0"}}> */}
      { myvalue.map((row, index) => (
      
        row ? row[gltf_Dict['name']] ? getMyName(row) : row+"\u2002": "\u0020"
      
      ))}
      {/* </div> */}
    </Button>

  )
}
