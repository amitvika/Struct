import React, { useState, useEffect } from 'react'
import MaterialTable from "material-table";

export default function TableOrderView({
  handleDataRowClick = () => {},
  list,
  columns,
  setColumns,
  title
}) {

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
        selection: false,
        search: true,
        
      }}


      onRowClick={(event, rowdata) => {
        
        if(handleDataRowClick) {          
         
          handleDataRowClick(rowdata,event);
        }
      }}
      
    />
  )
}
