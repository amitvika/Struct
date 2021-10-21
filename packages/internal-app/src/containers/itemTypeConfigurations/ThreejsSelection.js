import React from 'react';
import {
  SELECTSOLID,
  SELECTLINEAR,
  SELECTCIRCULAR,
  gltf_Dict,
  SELECTFEATURE,
} from '@monostruct/common/gltf/Tree/utils';
import Button from '@material-ui/core/Button';

export default function ThreejsSelection(props) {
  const { renderData,
          setRenderData,
          value,  
          mykey,
          mytype,
          active, 
          onChange,
          onClick } = props;
  const myvalue = value ? value: ["No Data Selected"];
  console.log("THRESSJSC",renderData,value,mykey);

  const getMyOption = ()=>{

    if((mytype=="PartSelection") || (mytype=="PartSelection3D") || (mytype=="MotionControlKinematicModelling") ) return SELECTSOLID;
    if(mytype=="CircularFaceOrEdgeSelection") return SELECTCIRCULAR;
    if(mytype=="LinearFaceOrEdgeSelection3D") return SELECTLINEAR;
    return SELECTFEATURE;
  };

  const getMyName = (item) => {
    let myelement = item[gltf_Dict['element']];
    let myName = item[gltf_Dict['name']];
    //let myCode = item[gltf_Dict['geometry']];
    let first4chars = myName.slice(0, 4);
    let first6chars = myName.slice(0, 6);
    if (myelement) {
      first4chars = myelement;
      first6chars = myelement;
      if (myelement == 'F') {
        first4chars = 'FACE';
      } else if (myelement == 'E') {
        first4chars = 'EDGE';
      } else if (myelement == 'V') {
        first6chars = 'VERTEX';
      } else if (myelement == 'P') {
        first4chars = 'PART';
      } else if (myelement == 'f' || myelement == 'e' || myelement == 'v') {
        first6chars = 'SLICER';
      }
    }
    if (((mytype=="PartSelection") || (mytype=="PartSelection3D") || (mytype=="MotionControlKinematicModelling") )
       && (first4chars=="PART") ) {
      return myName+"\u2003";
    } else if ( ((mytype!="PartSelection") && (mytype!="PartSelection3D") && (mytype!="MotionControlKinematicModelling") )
           && ( (first4chars=="EDGE") || (first4chars=="FACE") ) ) {
      return myName+"\u2003";
    } else {
      return '\u0020';
    }
  };
  const getComponents=(myvalue)=> {
    return myvalue.map((row, index) => (
        
      row ? row[gltf_Dict['name']] ? getMyName(row) : row+"\u2002": "\u0020"
    
    ));
  }
  const getEmpty=(myvalue)=> {
    for (let index = 0; index < myvalue.length; index++) {
      const item = myvalue[index];
      if(item && item[gltf_Dict['name']]) {
        let myelement = item[gltf_Dict['element']];
        let myName = item[gltf_Dict['name']];
        //let myCode = item[gltf_Dict['geometry']];
        let first4chars = myName.slice(0, 4);
        let first6chars = myName.slice(0, 6);
        if (myelement) {
          first4chars = myelement;
          first6chars = myelement;
          if (myelement == 'F') {
            first4chars = 'FACE';
          } else if (myelement == 'E') {
            first4chars = 'EDGE';
          } else if (myelement == 'V') {
            first6chars = 'VERTEX';
          } else if (myelement == 'P') {
            first4chars = 'PART';
          } else if (myelement == 'f' || myelement == 'e' || myelement == 'v') {
            first6chars = 'SLICER';
          }
        };
        if (((mytype=="PartSelection") || (mytype=="PartSelection3D") || (mytype=="MotionControlKinematicModelling") )
          && (first4chars=="PART") ) {
          return true;
        } else if ( ((mytype!="PartSelection") && (mytype!="PartSelection3D") && (mytype!="MotionControlKinematicModelling") )
              && ( (first4chars=="EDGE") || (first4chars=="FACE") ) ) {
          return true;
        };
      }
      
    }
    return false;
  }
  return (
    <Button
        aria-describedby={'Save Controls'}
        id={'popselect'}
        type="button"
        variant="contained"
        color={active?"primary":"default"}
        onClick={(event) => {             
          const myoption= getMyOption();   
          console.log("THRESSJSOC",renderData,"VALUE",value,"KEY",mykey,"TYPE",mytype,"OPTION",myoption);
          setRenderData(value,
            {name:mykey,
              option:myoption},
            onChange);
          onClick(mykey);               
        }}
      >
      {/* <div style={{background:active?"#A0A0A0":"#D0D0D0"}}> */}
      { getEmpty(myvalue) ? 'Please select features' :  getComponents(myvalue)  }
     
      {/* </div> */}
    </Button>
  );
}
