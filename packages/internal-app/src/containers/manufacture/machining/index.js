import React from 'react';
import ProcessConfigurationAssembly from './processConfiguration/processConfigurationAssembly';
import ProcessStaticsAndAnalysis from './processStatisticsAndAnalysis';

export default function Machining({
    selectedSubTab
}) {

    const render = () => {

        if (selectedSubTab === 'Process Configuration') {
            return (<ProcessConfigurationAssembly />)
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
