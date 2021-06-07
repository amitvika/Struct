import React from 'react'
import ProcessConfiguration from './processConfiguration'
import ManufacturabilityAnalysis from './ManufacturabilityAnalysis'

export default function Storage({ selectedSubTab }) {
    return (
        <div>
            {
                selectedSubTab === 'Process Configuration' ?
                    <ProcessConfiguration
                    /> : null
            }
            {
                 selectedSubTab === 'Manufacturability Analysis' ?
                        <ManufacturabilityAnalysis /> : null
            }
        </div>
    )
}