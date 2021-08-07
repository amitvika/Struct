import React, { useState, useEffect } from 'react'
import MaterialTable from "material-table";

export default function TableView({
  handleAdd = () => Promise.resolve(),
  handleUpdate = () => Promise.resolve(),
  handleDelete = () => Promise.resolve(),
  handleTableRowClick = () => { },
  handleDataRowClick = () => {},
  list,
  clientList = [],
  columns,
  setColumns,
  isAddEditActionsEnabled = false,
  title,
  isSelectionEnabled = false,
  isSearchEnabled = false
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
  //const [data,setData] = useState(list);

  return (
    <MaterialTable
      columns={columns}
      data={list}
      title={title}
      options={{
        actionsColumnIndex: 6,
        addRowPosition: "first",
        exportButton: false,
        exportFileName: "Client",
        cellStyle: {
          textAlign: 'center'
        },
        headerStyle: {
          textAlign: 'center',
          fontWeight: 'bold'
        },
        rowStyle:  rowData => ({
          backgroundColor: rowData.selectedshell ?   "#0f0" : "#fff" 
        }),
        selection: isSelectionEnabled,
        search: isSearchEnabled,
        
      }}


      onRowClick={(event, rowdata) => {
        //console.log("rowData",rowdata,"Event",event)
        const selection = window.getSelection();
        if (selection.type != "Range") {
          handleTableRowClick(rowdata)
        }
        if(handleDataRowClick) {          
          /* let rslts = [...data];
          const rIndex = rslts.indexOf(rowdata);
          for (let index = 0; index < rowdata.length; index++) {
            rslts[index].selectedshell=rIndex==rIndex;            
          }        
          console.log(rslts);
          setData(rslts); */
          handleDataRowClick(rowdata,event);
        }
      }}
      editable={isAddEditActionsEnabled ? {
        onRowAdd: (newData, oldData) => handleAdd(newData, oldData),
        onRowUpdate: (newData, oldData) => handleUpdate(newData, oldData),
        onRowDelete: oldData => handleDelete(oldData)
      } : {}}
    />
  )
}
