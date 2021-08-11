import React from 'react'
import ProcessConfiguration from './processConfiguration'
import ManufacturabilityAnalysis from './ManufacturabilityAnalysis'

export default function Storage(props) {
    const { selectedSubTab } = props;
    return (
        <div>
            {
                selectedSubTab === 'Process Configuration' ?
                    <ProcessConfiguration {...props}/> : null
            }
            {
                 selectedSubTab === 'Manufacturability Analysis' ?
                        <ManufacturabilityAnalysis {...props}/> : null
            }
        </div>
    )
}