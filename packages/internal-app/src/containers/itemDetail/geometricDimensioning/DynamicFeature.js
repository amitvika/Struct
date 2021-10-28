import React, { useState } from 'react';
import InternalCircularFaces from './InternalCircularFaces';
import HoleTolerancing from './HoleTolerancing';

export default function DynamicFeature() {
  const [state, setState] = useState({ selectedHoleValue: '' });

  const handleStateUpdate = (change) => {
    setState({ ...state, ...change });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <InternalCircularFaces {...state} {...{ handleStateUpdate }}/>
      <HoleTolerancing {...state} {...{ handleStateUpdate }} />
    </div>
  );
}
