import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import { useHistory, useParams } from 'react-router-dom';

import API from '@monostruct/common/api/clients.api';

import TableView from '@monostruct/common/components/TableGridView/TableView';
import GridView from '@monostruct/common/components/TableGridView/GridView';
import Toolbar from '@monostruct/common/components/TableGridView/Toolbar';
import { columnsFields } from '@monostruct/common/constants/client';

import { showErrorAlert } from '../../../actions/alert.action';
import get from 'lodash/get';

const Client = () => {
  let history = useHistory();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [clientList, setClientList] = useState([]);
  const [filteredClientList, setFilteredClientList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
  const [isGridViewSelected, setIsGridViewSelected] = useState(true);
  const { id } = useParams();

  const [columns, setColumns] = useState([
    { title: 'ID', field: 'id', editable: 'never', align: 'center' },
    { title: 'Name', field: 'name', type: 'text' },
    {
      title: 'Created By',
      field: 'created_by',
      editable: 'never'
    }
  ]);

  useEffect(() => {
    fetchClientList();
  }, []);

  const fetchClientList = async () => {
    try {
      setIsLoading(true);

      const clientRes = await API.fetchClientsApi(`item_id=${id}`);

      const clients = get(clientRes, 'data', []).map((x, index) => {
        return {
          id: x._id,
          name: x.name,
          created_by: x.createdByUserId.name,
          deleted_at: x.deletedAt,
          logoUrl: x.logoUrl
        };
      });
      setClientList(clients);
      setFilteredClientList(clients);

      setIsLoading(false);
    } catch (error) {
      dispatch(showErrorAlert({ message: 'Unable to fetch clients' }));
    }
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
    //   }),
    // () => this.retrieveFromDb()
    // );
  };

  const handleHistoryToggle = ({ rowId }) => {
    setIsHistoryModalOpened(!isHistoryModalOpened);
    setSelectedClientId(rowId);
  };

  const handleSearchBar = (searchText, searchLabel) => {
    console.log(searchText, searchLabel);
    // const searchText = event.target.value;
    if (searchText.length == 0) {
      setFilteredClientList(clientList);
    } else {
      setFilteredClientList(
        clientList.filter((product) => {
          const label = product[searchLabel];
          if (label.includes(searchText)) {
            return true;
          } else {
            return false;
          }
        })
      );
    }
  };

  const handleTableRowClick = (event) => history.push(`/clients/${event.id}`);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <Toolbar
        // title={'Clients'}
        isGridViewSelected={isGridViewSelected}
        setIsGridViewSelected={setIsGridViewSelected}
        handleSearchBar={handleSearchBar}
        isDeletedItemVisible={isDeletedItemVisible}
        handleShowDelete={handleShowDelete}
        isHistoryModalOpened={isHistoryModalOpened}
        handleHistoryToggle={handleHistoryToggle}
        list={clientList}
        filteredList={filteredClientList}
        setFilteredList={setFilteredClientList}
        columnsFields={columnsFields}
        isDeleteCheckboxVisible={false}
        isHistoryCheckboxVisible={false}
      />

      {isGridViewSelected ? (
        <GridView
          list={filteredClientList}
          handleHistoryToggle={handleHistoryToggle}
          columnsFields={columnsFields}
          handleTableRowClick={handleTableRowClick}
          isHistoryLinkVisible={false}
          isInsideDetailPanel={true}
        />
      ) : (
        <TableView
          list={filteredClientList}
          columns={columns}
          setColumns={setColumns}
          handleTableRowClick={handleTableRowClick}
          isAddEditActionsEnabled={false}
        />
      )}
    </>
  );
};

export default Client;
