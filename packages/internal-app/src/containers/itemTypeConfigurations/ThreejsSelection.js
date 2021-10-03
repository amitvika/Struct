import React from 'react'
import { gltf_Dict } from '@monostruct/common/gltf/Tree/utils'
import { NavigateBeforeSharp } from '@material-ui/icons'
export default function ThreejsSelection(renderData,setRenderData,value,key) {
  const myvalue = value ? value: ["No Data Selected"];
  return (
    <div onClick={()=>setRenderData(value,key)}>
      {key}:
      {myvalue.map((row, index) => (
      
      row ? row[gltf_Dict['name']] ? row[gltf_Dict['name']] +"\u2003" : row+"\u2002": "\u0020"
      
      ))}
    </div>
  )
}
