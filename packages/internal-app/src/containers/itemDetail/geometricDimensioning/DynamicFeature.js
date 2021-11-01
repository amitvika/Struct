import React, { useState, useEffect } from 'react';
import InternalCircularFaces from './InternalCircularFaces';
import HoleTolerancing from './HoleTolerancing';

export default function DynamicFeature({ selectedFeature = {} }) {
  const [state, setState] = useState({ selectedHoleValue: '', });

  useEffect(() => {}, [selectedFeature]);

  const handleStateUpdate = (change) => {
    setState({ ...state, ...change });
  };

  // if (!state.selectedHoleValue) {
  //   return null;
  // }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <InternalCircularFaces
        {...state}
        {...{ holeSize: selectedFeature.diameter, handleStateUpdate }}
      />
      {/* <HoleTolerancing {...state} {...{ handleStateUpdate }} /> */}
    </div>
  );
}
