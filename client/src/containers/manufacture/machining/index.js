import React from 'react'
import ProcessConfiguration from './processConfiguration'

export default function Machining({
    selectedSubTab
}) {
    return (
        <div>
            {
                selectedSubTab === 'Process Configuration' ?
                    <ProcessConfiguration /> : null
            }

        </div>
    )
}
