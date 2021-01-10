import React, { useState, useEffect } from 'react'
import MaterialTable, { MTableToolbar } from "material-table";
import Toolbar from '../../../components/Toolbar';
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';

export default function TableView({
  title,
  list,
  clientList,
  isDeletedItemVisible,
  handleHistoryToggle,
  handleShowDelete,
  isHistoryModalOpened,
  addProductDesign,
  updateProductDesign,
  deleteProductDesign
}) {
  let history = useHistory();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const [columns, setColumns] = useState([
    { title: "ID", field: "id", editable: "never", align: 'center' },
    { title: "Name", field: "name" },
    {
      title: "Client",
      field: "client",
      lookup: { 34: "İstanbul", 63: "Şanlıurfa" }
    },
    {
      title: "Created By",
      field: "created_by",
      editable: "never",
      initialEditValue: isAuthenticated
        ? user.name
        : "Guest"
    },
    {
      title: 'History',
      field: "id",
      editable: "never",
      render: rowData => rowData && <span style={{ cursor: 'pointer' }}
        onClick={(event) => {
          event.stopPropagation();
          handleHistoryToggle({ rowId: rowData.id })
        }}> Show History </span>
    },
  ])

  useEffect(() => {

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
        title={title}
        options={{
          actionsColumnIndex: 5,
          addRowPosition: "first",
          exportButton: false,
          exportFileName: "ProductDesign",
          cellStyle: {
            textAlign: 'center'
          },
          headerStyle: {
            textAlign: 'center'
          }
        }}
        onRowClick={(rowdata, event) => {
          const selection = window.getSelection();
          if (selection.type != "Range") {
            history.push(`/process-groups/${event.id}`);
          }
        }}
        editable={{
          onRowAdd: (newData, oldData) => addProductDesign(newData, oldData),
          onRowUpdate: (newData, oldData) => updateProductDesign(newData, oldData),
          onRowDelete: oldData => deleteProductDesign(oldData)

        }}
      //////
      />
    </div>
  )
}
