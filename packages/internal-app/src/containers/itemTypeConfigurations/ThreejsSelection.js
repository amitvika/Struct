import React from 'react'
import { gltf_Dict } from '@monostruct/common/gltf/Tree/utils'
import { NavigateBeforeSharp } from '@material-ui/icons'
export default function ThreejsSelection(props) {
  const { renderData,
          setRenderData,
          value,  
          mykey, 
          onChange } = props;
  const myvalue = value ? value: ["No Data Selected"];
  console.log("THRESSJSC",renderData,value,mykey);
  return (
    <div onClick={()=>{
        console.log("THRESSJSOC",renderData,"VALUE",value,"KEY",mykey);
        setRenderData(value,mykey,onChange);
        }
      }>
      {/* {mykey}: */}
      { myvalue.map((row, index) => (
      
        row ? row[gltf_Dict['name']] ? row[gltf_Dict['name']] +"\u2003" : row+"\u2002": "\u0020"
      
      ))}
    </div>
  )
}
