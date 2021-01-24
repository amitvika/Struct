import React from 'react'
import ProcessConfiguration from './processConfiguration'

export default function Assembly({ selectedSubTab }) {
    return (
        <div>
            {
                selectedSubTab === 'Process Configuration' ?
                    <ProcessConfiguration /> : null
            }

        </div>
    )
}
