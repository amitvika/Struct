import React from 'react';
import ProcessConfiguration from './processConfiguration';
import ProcessStaticsAndAnalysis from './processStatisticsAndAnalysis';

export default function Machining({
    selectedSubTab
}) {

    const render = () => {

        if (selectedSubTab === 'Process Configuration') {
            return (<ProcessConfiguration />)
        }
        else if (selectedSubTab === 'Process Statistics and Analysis') {
            return (<ProcessStaticsAndAnalysis />)
        }
        else {

        }
    }

    return (
        <div>
            { render()

            }

        </div>
    )
}
