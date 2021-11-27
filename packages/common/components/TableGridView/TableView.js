import React, { useState, useEffect } from 'react';
import MaterialTable, { MTableToolbar } from 'material-table';
import Paper from '@material-ui/core/Paper';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HistoryIcon from '@mui/icons-material/History';

export default function TableView({
  handleAdd = () => Promise.resolve(),
  handleUpdate = () => Promise.resolve(),
  handleDelete = () => Promise.resolve(),
  handleTableRowClick = () => {},
  list,
  clientList = [],
  columns,
  setColumns,
  isAddEditActionsEnabled = false,
  title,
  isSelectionEnabled = false,
  isSearchEnabled = false,
  handleHistoryToggle = () => null,
  showToolbar = false
}) {
  useEffect(() => {
    if (clientList.length == 0) {
      return;
    }
    let clientLookupList = {};
    clientList.forEach((client) => {
      clientLookupList[client._id] = client.name;
    });

    setColumns((prevColoumn) => {
      prevColoumn[2].lookup = clientLookupList;
      return prevColoumn;
    });
  }, [clientList]);
  //const [data,setData] = useState(list);

  const handleCopyId = (event, rowData) => {
    navigator.clipboard.writeText(rowData.id);
    event.stopPropagation();
  };

  return (
    <MaterialTable
      columns={columns}
      data={list}
      title={title}
      components={{
        Container: (props) => <Paper {...props} style={{ padding: 10 }} />,
        Toolbar: (props) => (
          <>
            {showToolbar ? (
              <MTableToolbar {...props} />
            ) : (
              <div
                style={{
                  height: '0px'
                }}
              >
                <MTableToolbar {...props} />
              </div>
            )}
          </>
        )
      }}
      options={{
        actionsColumnIndex: 6,
        addRowPosition: 'first',
        exportButton: false,
        exportFileName: 'Client',
        cellStyle: {
          textAlign: 'center'
        },
        headerStyle: {
          textAlign: 'center',
          fontWeight: 'bold'
        },
        selection: isSelectionEnabled,
        search: isSearchEnabled,
        // showTitle: false,
        paging: false
      }}
      actions={[
        {
          icon: () => <ContentCopyIcon />,
          tooltip: 'Copy ID',
          onClick: handleCopyId
        },
        {
          icon: () => <HistoryIcon />,
          tooltip: 'History',
          onClick: handleHistoryToggle
        }
      ]}
      onRowClick={(event, rowdata) => {
        //console.log("rowData",rowdata,"Event",event)
        const selection = window.getSelection();
        if (selection.type != 'Range') {
          handleTableRowClick(rowdata);
        }
      }}
      editable={
        isAddEditActionsEnabled
          ? {
              onRowAdd: (newData, oldData) => handleAdd(newData, oldData),
              // onRowUpdate: (newData, oldData) => handleUpdate(newData, oldData),
              onRowDelete: (oldData) => handleDelete(oldData)
            }
          : {}
      }
    />
  );
}
