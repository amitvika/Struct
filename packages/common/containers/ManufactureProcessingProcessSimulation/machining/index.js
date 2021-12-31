import React from 'react';
import ProcessConfigurationAssemblyForMachining from './processConfiguration/index2';
import ProcessStaticsAndAnalysis from './processStatisticsAndAnalysis';

export default function Machining(props) {
  const { selectedSubTab } = props;
  const render = () => {
    if (selectedSubTab === 'Process Configuration') {
      return <ProcessConfigurationAssemblyForMachining {...props} />;
    } else if (selectedSubTab === 'Process Statistics and Analysis') {
      return <ProcessStaticsAndAnalysis />;
    } else {
    }
  };

  return <div>{render()}</div>;
}
