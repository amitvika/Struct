import React, { useState, useEffect } from 'react'
import MaterialTable, { MTableToolbar } from "material-table";

export default function TableView({
  handleAdd = () => { },
  handleUpdate = () => { },
  handleDelete = () => { },
  handleTableRowClick = () => { },
  list,
  clientList = [],
  columns,
  setColumns,
  isActionHidden = false
}) {

  useEffect(() => {

    if (clientList.length == 0) {
      return;
    }
    let clientLookupList = {};
    clientList.forEach(client => {
      clientLookupList[client._id] = client.name;
    });

    setColumns(prevColoumn => {
      prevColoumn[2].lookup = clientLookupList;
      return prevColoumn;
    });

  }, [clientList])

  return (
    <div>
      <MaterialTable
        columns={columns}
        data={list}
        // title="New Product Design"
        options={{
          actionsColumnIndex: 5,
          addRowPosition: "first",
          exportButton: false,
          exportFileName: "Client",
          cellStyle: {
            textAlign: 'center'
          },
          headerStyle: {
            textAlign: 'center',
            fontWeight: 'bold'
          }
        }}
        onRowClick={(rowdata, event) => {
          const selection = window.getSelection();
          if (selection.type != "Range") {
            handleTableRowClick(event)
          }
        }}
        editable={{
          onRowAdd: (newData, oldData) => handleAdd(newData, oldData),
          onRowUpdate: (newData, oldData) => handleUpdate(newData, oldData),
          onRowDelete: oldData => handleDelete(oldData),
          isEditHidden: rowData => isActionHidden,
          isDeleteHidden: rowData => isActionHidden,
        }}
      />
    </div>
  )
}
