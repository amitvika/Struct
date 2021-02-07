import React from 'react'
import ProcessConfiguration from './processConfiguration'

export default function Storage({selectedSubTab}) {
       return (
        <div>
            {
                selectedSubTab === 'Process Configuration' ?
                    <ProcessConfiguration
                        /> : null
            }
        </div>
    )
}