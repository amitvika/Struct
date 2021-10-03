import React from 'react'
import { gltf_Dict } from '@monostruct/common/gltf/Tree/utils'
import { NavigateBeforeSharp } from '@material-ui/icons'
export default function ThreejsSelection({renderData,setRenderData,value,key,OnChange}) {
  const myvalue = value ? value: ["No Data Selected"];
  console.log("THRESSJS",setRenderData);
  return (
    <div onClick={()=>setRenderData(value,key,OnChange)}>
      {key}:
      {myvalue.map((row, index) => (
      
      row ? row[gltf_Dict['name']] ? row[gltf_Dict['name']] +"\u2003" : row+"\u2002": "\u0020"
      
      ))}
    </div>
  )
}
