import React, { useState, useEffect } from "react";

import AssemblyTable from './AssemblyTable';
import ThreejsViewModal from './ThreejsViewModal'

export default function Assembly({ processId }) {
  const [assemblyProcessId, setAssemblyProcessId] = useState('');
  const [isThreejsVisible, setIsThreejsVisible] = useState(false);
  return (
    <div>
      <ThreejsViewModal
        isVisible={isThreejsVisible}
        setIsThreejsVisible={setIsThreejsVisible}
        assemblyProcessId={assemblyProcessId} />
      <AssemblyTable
        processId={processId}
        setIsThreejsVisible={setIsThreejsVisible}
        setAssemblyProcessId={setAssemblyProcessId} />
    </div>
  );
}
