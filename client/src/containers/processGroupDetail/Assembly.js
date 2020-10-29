import React, { useState, useEffect } from "react";

import AssemblyTable from './AssemblyTable';
import ThreejsViewModal from './ThreejsViewModal'

export default function Assembly({ processId }) {

  const [isThreejsVisible, setIsThreejsVisible] = useState(false);
  return (
    <div>
      <ThreejsViewModal
        isVisible={isThreejsVisible} />
      <AssemblyTable processId={processId} setIsThreejsVisible={setIsThreejsVisible} />
    </div>
  );
}
