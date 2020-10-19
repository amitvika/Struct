import React, { useState, useEffect } from 'react'
import MaterialTable, { MTableToolbar } from "material-table";
import AssemblyProcessAPI from '../api/assemblyProcess.api';

export default function AssemblyTable({ processId }) {
  const [columns, setColumns] = useState([
    { title: "Sequence", field: "id" },
    { title: "Action", field: "action" },
    { title: "Status ", field: "status" }
  ]);

  const [rowData, setRowData] = useState([]);

  const handleAddRow = () => {
    const rowLength = rowData.length;
    const data = [
      { id: rowLength + 1, action: "Work Holding 1", status: 'X4' },
      { id: rowLength + 2, action: "First Item Setup:", status: 'X' }
    ]

    setRowData(prev => [...prev, ...data])
  }

  useEffect(() => {
    if (processId) {
      AssemblyProcessAPI
        .fetchAssemblyProcessApi(processId)
        .then(response => {
          console.log('--response->>>>',response)
        })
        .catch(error => {

        })
    }
  }, [processId])

  return (
    <div>
      <MaterialTable
        columns={columns}
        data={rowData}
        title="Process Groups"
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
        onRowClick={(rowdata, event) => {
          const selection = window.getSelection();

          if (selection.type != "Range") {
            // this.props.history.push(`/process-groups/${event.id}`);
          }
        }}
      >

      </MaterialTable>

    </div>
  )
}
