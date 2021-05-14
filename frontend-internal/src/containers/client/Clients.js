import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom";

import API from '../../api/clients.api';

import TableView from '../../components/TableView';
import GridView from '../../components/GridView';
import Toolbar from '../../components/Toolbar';
import DefaultContainer from '../../components/DefaultContainer'
import { columnsFields } from '../../constants/client'
import AddEditClientModal from './AddEditClientModal';
import { useDispatch } from 'react-redux';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { newColoumnsFields } from '../../constants/client'

const Client = () => {
    let history = useHistory();
    const dispatch = useDispatch();

    const { isAuthenticated, user } = useSelector(state => state.auth);

    const [clientList, setClientList] = useState([]);
    const [filteredClientList, setFilteredClientList] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
    const [isGridViewSelected, setIsGridViewSelected] = useState(true);
    const [isAddEditClientModalOpened, setIsAddEditClientModalOpened] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedListItem, setSelectedListItem] = useState(null);



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
        fetchClientList();
    }, []);

    const fetchClientList = async () => {
        try {
            setIsLoading(true);

            const clientRes = await API.fetchClientsApi();

            if (clientRes && clientRes.data) {
                const clients = clientRes.data.map((x, index) => {
                    return {
                        id: x._id,
                        name: x.name,
                        created_by: x.createdByUserId.name,
                        deleted_at: x.deletedAt,
                        logoUrl: x.logoUrl
                    }
                })
                setClientList(clients)
                setFilteredClientList(clients)
            }
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
        setSelectedClientId(rowId)
    }


    const handleSearchBar = (searchText, searchLabel) => {
        console.log(searchText, searchLabel)
        // const searchText = event.target.value;
        if (searchText.length == 0) {
            setFilteredClientList(clientList);
        }
        else {
            setFilteredClientList(clientList.filter(product => {
                const label = product[searchLabel]
                if (label.includes(searchText)) {
                    return true;
                }
                else {
                    return false;
                }
            }))
        }
    }


    const addClient = (newData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    const newClient = {
                        name: newData.name,
                        user: isAuthenticated
                            ? user._id
                            : "Guest"
                    }; //

                    API.addClientApi(newClient)
                        .then(res => {
                            if (res.data) {
                                dispatch(showSuccessAlert({ message: 'New client added' }));

                                const updatedClientList = [
                                    { ...res.data, id: res.data._id },
                                    ...clientList
                                ];
                                setClientList(updatedClientList);
                                const updatedFilteredList = [
                                    { ...res.data, id: res.data._id, created_by: res.data.createdByUserId.name },
                                    ...filteredClientList
                                ];
                                setFilteredClientList(updatedFilteredList)

                            }
                        })
                        .catch(err => {
                            dispatch(showErrorAlert({ message: 'Unable to add client' }));
                        });

                }
                resolve();
            }, 10);
        })
    }

    const updateClient = (newData, oldData) => {
        return new Promise((resolve, reject) => {

            const data = {
                name: newData.name,
                user: user._id
            }

            API.updateClientApi(newData.id, data)
                .then(res => {
                    if (res.data) {
                        dispatch(showSuccessAlert({ message: 'Client updated successfully' }));

                        const updatedClientList = clientList.map(client => {
                            if (client.id === newData.id) {
                                return { ...res.data, id: res.data._id }
                            }
                            else {
                                return client
                            }
                        });

                        setClientList(updatedClientList);

                        const updatedFilteredList = filteredClientList.map(client => {
                            if (client.id === newData.id) {
                                return { ...res.data, id: res.data._id, created_by: res.data.createdByUserId.name }
                            }
                            else {
                                return client
                            }
                        })
                        setFilteredClientList(updatedFilteredList)

                    }
                    setIsEditing(false)
                })
                .catch(err => {
                    dispatch(showErrorAlert({ message: 'Unable to update client' }));
                });

            resolve();
        })
    }

    const deleteClient = (oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    API.deleteClientApi(oldData.id)
                        .then(res => {
                            const updatedClientList = clientList.filter(client => client.id != oldData.id);
                            setClientList(updatedClientList)

                            const updatedFilteredClientList = filteredClientList.filter(client => client.id != oldData.id);
                            setFilteredClientList(updatedFilteredClientList)

                            dispatch(showSuccessAlert({ message: 'Client removed successfully' }));
                        })
                        .catch(err => {
                            dispatch(showErrorAlert({ message: 'Unable to delete client' }));
                        });
                }
                resolve();
            }, 1000);
        })
    }

    const handleTableRowClick = (event) => history.push(`/clients/${event.id}`);

    const toggleAddEditClientModal = () => {
        if (isAddEditClientModalOpened) {
            setSelectedListItem(null);
            setIsEditing(false);
        }
        setIsAddEditClientModalOpened(!isAddEditClientModalOpened)

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
            title={'Clients'}
            selectedId={selectedClientId}
            handleHistoryToggle={handleHistoryToggle}
        >
            {
                isAddEditClientModalOpened &&
                <AddEditClientModal
                    title={"Add Client"}
                    fields={newColoumnsFields}
                    isAddEditClientModalOpened={isAddEditClientModalOpened}
                    toggleAddEditClientModal={toggleAddEditClientModal}
                    updateClient={updateClient}
                    isEditing={isEditing}
                    selectedValue={selectedListItem}
                    handleAdd={addClient}
                />
            }

            <Toolbar
                title={'Clients'}
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
                isCustomAddButtonVisible={true}
                handleAddButtonPress={toggleAddEditClientModal}
            />

            {
                isGridViewSelected ?
                    <GridView
                        isAddEditLinkVisible={true}
                        selectedId={selectedClientId}
                        handleEditButtonPress={toggleAddEditClientModal}
                        list={filteredClientList}
                        handleHistoryToggle={handleHistoryToggle}
                        columnsFields={columnsFields}
                        handleTableRowClick={handleTableRowClick}
                    /> :
                    <TableView
                        list={filteredClientList}
                        handleAdd={addClient}
                        handleUpdate={updateClient}
                        handleDelete={deleteClient}
                        columns={columns}
                        setColumns={setColumns}
                        handleTableRowClick={handleTableRowClick}
                    />

            }
        </DefaultContainer >
    );
}

export default Client;
