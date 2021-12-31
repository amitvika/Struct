import React from 'react';
import ProcessConfigurationAssembly from './processConfiguration/processConfigurationAssembly';
import ProcessStaticsAndAnalysis from './processStatisticsAndAnalysis';

export default function Machining(props) {
  const { selectedSubTab } = props;

  const render = () => {
    if (selectedSubTab === 'Process Configuration') {
      return <ProcessConfigurationAssembly {...props} />;
    } else if (selectedSubTab === 'Process Statistics and Analysis') {
      return <ProcessStaticsAndAnalysis />;
    } else {
    }
  };

  return <div>{render()}</div>;
}
