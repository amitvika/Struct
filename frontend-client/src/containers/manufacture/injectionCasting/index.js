import React from 'react'
import ProcessStatisticsAndAnalysis from './processStatisticsAndAnalysis'

export default function InjectionCasting({ selectedSubTab }) {
  return (
    <div>
      {
        selectedSubTab === 'Process Statistics and Analysis' ?
          <ProcessStatisticsAndAnalysis /> : null
      }
    </div>
  )
}
