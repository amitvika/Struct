import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom";

import API from '../../api/processGroup.api';
import ClientAPI from '../../api/clients.api';
import Toolbar from '../../components/TableGridView/Toolbar';
import TableView from '../../components/TableGridView/TableView';
import GridView from '../../components/TableGridView/GridView';
import DefaultContainer from '../../components/DefaultContainer';


const ProcessGroups = () => {
  const history = useHistory();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const [processGroupList, setProcessGroupList] = useState([]);
  const [filteredProcessGroupList, setFilteredProcessGroupList] = useState([]);

  const [clientList, setClientList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [snackBar, setSnackBar] = useState(false);
  const [snackBarAlertType, setSnackBarAlertType] = useState('');
  const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
  const [selectedProcessGroupId, setSelectedProcessGroupId] = useState('');
  const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
  const [isGridViewSelected, setIsGridViewSelected] = useState(true);
  const columnsFields = { 'id': 'ID', 'name': 'Name', 'clientName': 'Client Name', 'created_by': 'Created By' };

  const alertForError = (err) => {
    setIsLoading(false);
    if (err.response && err.response.data) {
      setMessage(err.response.data.message);
      setSnackBarAlertType("error");
      setSnackBar(true);
    }
  }

  const handleHistoryToggle = ({ rowId }) => {
    setIsHistoryModalOpened(!isHistoryModalOpened);
    setSelectedProcessGroupId(rowId)
  }

  const handleAlertClose = (event, reason) => {
    setSnackBar(!snackBar);
  };


  const handleShowDelete = () => {
    // const columns = this.state.columns;
    // if (!this.state.isDeletedItemVisible) {
    //   columns.push({ title: "Deleted At", field: "deleted_at" });
    // } else {
    //   columns.pop();
    // }
    // this.setState(
    //   state => ({
    //     isDeletedItemVisible: !state.isDeletedItemVisible
    //   })
    // );
  };

  useEffect(() => {
    fetchClientList();
    fetchProcessGroupList();
  }, []);

  const fetchClientList = async () => {
    try {
      const clientRes = await ClientAPI.fetchClientsApi();
      if (clientRes && clientRes.data) {
        setClientList(clientRes.data)
      }

    } catch (error) {
      alertForError(error)
    }
  }

  const fetchProcessGroupList = async () => {
    try {
      setIsLoading(true);

      const processGroupRes = await API.getProcessGroupsApi();

      if (processGroupRes && processGroupRes.data) {
        const processGroups = processGroupRes.data.map((x, index) => {
          return {
            id: x._id,
            name: x.name,
            client: x.client._id,
            clientName: x.client.name,
            created_by: x.createdBy.name,
            deleted_at: x.deletedAt
          }
        })

        setProcessGroupList(processGroups)
        setFilteredProcessGroupList(processGroups)
      }
      setIsLoading(false);

    } catch (error) {
      console.log(error)
      alertForError(error)
    }
  };

  const addProcessGroup = (newData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        {
          const newClient = {
            name: newData.name,
            client: newData.client,
            user: isAuthenticated
              ? user._id
              : "Guest"
          };

          API.addProcessGroupApi(newClient)
            .then(res => {
              fetchProcessGroupList();
            })
            .catch(err => {
              alertForError(err)
            });

        }
        resolve();
      }, 10);
    })
  }

  const updateProcessGroup = (newData, oldData) => {
    new Promise((resolve, reject) => {
      setTimeout(() => {
        {
          console.log(newData.client);
          const data = {
            name: newData.name,
            user: user._id,
            client: newData.client
          }

          API.updateProcessGroupApi(newData.id, data)
            .then(res => {
              fetchProcessGroupList()
            })
            .catch(err => {
              alertForError(err)
            });

        }
        resolve();
      }, 1000);
    })
  }

  const deleteProcessGroup = (oldData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        {
          API.deleteProcessGroupApi(oldData.id)
            .then(res => {
              fetchProcessGroupList();
            })
            .catch(err => {
              alertForError(err)
            });
        }
        resolve();
      }, 1000);
    })
  }

  const handleTableRowClick = (event) => {
    history.push(`/process-groups/${event.id}`);
  }


  if (isLoading) {
    return (<div
      style={{
        display: "flex",
        justifyContent: "center"
      }}
    >
      <Spinner animation="border" />
    </div>)
  }

  return (
    <DefaultContainer
      isHistoryModalOpened={isHistoryModalOpened}
      title={'ProcessGroups'}
      selectedId={selectedProcessGroupId}
      handleHistoryToggle={handleHistoryToggle}
      snackBar={snackBar}
      handleAlertClose={handleAlertClose}
      message={message}
      snackBarAlertType={snackBarAlertType}>

      <Toolbar
        title={'Process Groups'}
        isGridViewSelected={isGridViewSelected}
        setIsGridViewSelected={setIsGridViewSelected}
        // handleSearchBar={handleSearchBar}
        isDeletedItemVisible={isDeletedItemVisible}
        handleShowDelete={handleShowDelete}
        isHistoryModalOpened={isHistoryModalOpened}
        handleHistoryToggle={handleHistoryToggle}
        list={processGroupList}
        filteredList={filteredProcessGroupList}
        setFilteredList={setFilteredProcessGroupList}
        columnsFields={columnsFields}
        clientList={clientList}
      />

      {
        isGridViewSelected ?
          <GridView
            list={filteredProcessGroupList}
            handleHistoryToggle={handleHistoryToggle}
            columnsFields={columnsFields}
            handleTableRowClick={handleTableRowClick} /> :
          <TableView
            title={'Process Groups'}
            list={filteredProcessGroupList}
            isDeletedItemVisible={isDeletedItemVisible}
            handleHistoryToggle={handleHistoryToggle}
            handleShowDelete={handleShowDelete}
            isHistoryModalOpened={isHistoryModalOpened}
            add={addProcessGroup}
            update={updateProcessGroup}
            delete={deleteProcessGroup}
            clientList={clientList}
            handleTableRowClick={handleTableRowClick}
          />

      }
    </DefaultContainer>
  );
}

export default ProcessGroups;
