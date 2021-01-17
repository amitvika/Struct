import React, { useState, useEffect } from 'react'
import MaterialTable, { MTableToolbar } from "material-table";
import AssemblyProcessAPI from '../../../../api/assemblyProcess.api';

export default function AssemblyTable({ processId, setIsThreejsVisible, setAssemblyProcessData }) {
  const [columns, setColumns] = useState([
    { title: "Sequence #", field: "serialNumber" },
    { title: "Action", field: "action" },
    { title: "Status ", field: "status" }
  ]);

  const [rowData, setRowData] = useState([]);

  const handleAddRow = () => {
    const rowLength = rowData.length;
    let data = [];
    if (rowLength == 0) {
      data = [
        { serialNumber: rowLength + 1, action: "Work Holding 1", status: 'X4', assemblyId: processId },
        { serialNumber: rowLength + 2, action: "First Item Setup", status: 'X', assemblyId: processId }
      ]
    }
    else {
      data = [
        { serialNumber: rowLength + 1, action: "First Item Setup", status: 'X4', assemblyId: processId }
      ]
    }
    AssemblyProcessAPI.addAssemblyProcessApi({ assembly_processes: data })
      .then(data => {
        console.log(data);
      })

    setRowData(prev => [...data, ...prev])
  }

  useEffect(() => {
    if (processId) {
      setIsThreejsVisible(false);
      AssemblyProcessAPI
        .fetchAssemblyProcessApi(processId)
        .then(result => {
          setRowData(result.data);
        });
    }

  }, [processId])

  return (
    <div>
      <MaterialTable
        columns={columns}
        data={rowData}
        title="Assembly Sequence Setup"
        options={{
          addRowPosition: "first",
          actionsColumnIndex: 4
        }}
        icons={{
          Add: props => <></>
        }}
        actions={[
          {
            icon: 'add',
            onClick: (event, rowData) => {
              handleAddRow(rowData.id)
            },
            isFreeAction: true,
            tooltip: 'Add Button',
          }
        ]}
        onRowClick={(event, rowdata) => {
          setAssemblyProcessData(rowdata)
          setIsThreejsVisible(true);
        }}
      >

      </MaterialTable>

    </div>
  )
}
