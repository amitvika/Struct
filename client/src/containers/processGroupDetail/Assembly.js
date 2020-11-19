import React, { useState, useEffect } from "react";

import AssemblyTable from './AssemblyTable';
import ThreejsViewModal from './ThreejsViewModal'

export default function Assembly({ processId }) {
  const [assemblyProcessData, setAssemblyProcessData] = useState('');
  const [isThreejsVisible, setIsThreejsVisible] = useState(false);
  
  return (
    <div>
      <ThreejsViewModal
        isVisible={isThreejsVisible}
        setIsThreejsVisible={setIsThreejsVisible}
        assemblyProcessData={assemblyProcessData} />
      <AssemblyTable
        processId={processId}
        setIsThreejsVisible={setIsThreejsVisible}
        setAssemblyProcessData={setAssemblyProcessData} />
    </div>
  );
}
