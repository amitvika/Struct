import React, { useState, useEffect } from "react";

import AssemblyTable from './AssemblyTable';
import AssemblyThreejsView from './AssemblyThreejsView'

export default function Assembly({ processId }) {

  return (
    <div>
      <AssemblyThreejsView />
      <AssemblyTable processId={processId} />
    </div>
  );
}
