import React, { useState } from 'react'
import MaterialTable, { MTableToolbar } from "material-table";

export default function AssemblyTable() {
  const [columns, setColumns] = useState([
    { title: "Sequence", field: "id", editable: "never", render: rowData => rowData ? rowData.id + 1 : 1 },
    { title: "Action", field: "action", lookup: { 34: "Work Holding 1", 63: "First Item Setup:" } },
    { title: "Status ", field: "status", lookup: { 34: "X4", 63: "X" } }
  ]);

  const [rowData, setRowData] = useState([]);

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
        onRowClick={(rowdata, event) => {
          const selection = window.getSelection();

          if (selection.type != "Range") {
            // this.props.history.push(`/process-groups/${event.id}`);
          }
        }}
        editable={{
          onRowAdd: newData => {
            return new Promise((resolve, reject) =>{
              // setRowData(newData);
              resolve();
            }) 
          }
        }}
      >

      </MaterialTable>

    </div>
  )
}
