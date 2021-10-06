import React from 'react'
import { gltf_Dict } from '@monostruct/common/gltf/Tree/utils'
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
  return (
    <Button
        aria-describedby={'Save Controls'}
        id={'popselect'}
        type="button"
        variant="contained"
        color={active?"primary":"default"}
        onClick={(event) => {                 
          console.log("THRESSJSOC",renderData,"VALUE",value,"KEY",mykey);
          setRenderData(value,mykey,onChange);
          onClick(mykey);               
        }}
      >
      {/* <div style={{background:active?"#A0A0A0":"#D0D0D0"}}> */}
      { myvalue.map((row, index) => (
      
        row ? row[gltf_Dict['name']] ? row[gltf_Dict['name']] +"\u2003" : row+"\u2002": "\u0020"
      
      ))}
      {/* </div> */}
    </Button>

  )
}
