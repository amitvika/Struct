import React, { useState, useEffect } from 'react'
import MaterialTable, { MTableToolbar } from "material-table";
import Toolbar from '../../../components/Toolbar';
import { useHistory } from "react-router-dom";
import { useSelector } from 'react-redux';

export default function TableView({
  clientList,
  handleHistoryToggle,
  addClient,
  updateClient,
  deleteClient
}) {
  let history = useHistory();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const [columns, setColumns] = useState([
    { title: "ID", field: "id", editable: "never", align: 'center' },
    { title: "Name", field: "name" },
    {
      title: "Created By",
      field: "created_by",
      editable: "never"
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
        data={clientList}
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
            textAlign: 'center'
          }
        }}
        onRowClick={(rowdata, event) => {
          const selection = window.getSelection();
          if (selection.type != "Range") {
            history.push(`/clients/${event.id}`);
          }
        }}
        editable={{
          onRowAdd: (newData, oldData) => addClient(newData, oldData),
          onRowUpdate: (newData, oldData) => updateClient(newData, oldData),
          onRowDelete: oldData => deleteClient(oldData)

        }}
      //////
      />
    </div>
  )
}
