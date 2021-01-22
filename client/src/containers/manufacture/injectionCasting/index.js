import React from 'react'
import ProcessConfiguration from './processConfiguration'

export default function InjectionCasting({ selectedSubTab }) {
  return (
    <div>
      {
        selectedSubTab === 'Process Configuration' ?
          <ProcessConfiguration /> : null
      }
    </div>
  )
}
