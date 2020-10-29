import React, { useState, useEffect } from 'react';
import MaterialTable, { MTableToolbar } from "material-table";

export default function CurrentUsage() {
  const [columns, setColumns] = useState([
    { title: "Process Id", field: "processsId" },
    { title: "# of instances", field: "action" },
    { title: "Total Usage ", field: "totalUsage" }
  ]);
  const [rowData, setRowData] = useState([]);

  return (
    <div>
      <MaterialTable
        columns={columns}
        data={rowData}
        title="Assembly Sequence Setup"
      />
    </div>
  )
}
