import React from 'react'
import ProcessConfiguration from './processConfiguration'
import ManufacturabilityAnalysis from './ManufacturabilityAnalysis'

export default function FullProcess({ selectedSubTab }) {

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


