import React from 'react'
import { gltf_Dict } from '@monostruct/common/gltf/Tree/utils'
import { NavigateBeforeSharp } from '@material-ui/icons'
export default function ThreejsSelection(renderData,setRenderData,value) {
  return (
    <div onClick={()=>setRenderData(value)}>
      {value.map((row, index) => (
      
      row ? row[gltf_Dict['name']]+"&nbsp;" : ""
      
      ))}
    </div>
  )
}
