import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom"

import FactoriesAPI from '../../api/factories.api';

import TableView from '../../components/TableView';
import GridView from '../../components/GridView';
import Toolbar from '../../components/Toolbar';
import DefaultContainer from '../../components/DefaultContainer'
import { columnsFields } from '../../constants/factory'
import AddEditFactoryModal from './AddEditFactoryModal'
import { newColoumnsFields } from '../../constants/factory'

import { useDispatch } from 'react-redux';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';

const Factories = () => {
    let history = useHistory();
    const dispatch = useDispatch();

    const { isAuthenticated, user } = useSelector(state => state.auth);

    const [factoryList, setFactoryList] = useState([]);
    const [filteredFactoryList, setFilteredFactoryList] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
    const [selectedFactoryId, setSelectedFactoryId] = useState('');
    const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
    const [isGridViewSelected, setIsGridViewSelected] = useState(true);

    const [isAddEditModalOpened, setIsAddEditModalOpened] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedListItem, setSelectedListItem] = useState(null);

    const [columns, setColumns] = useState([
        { title: "ID", field: "id", editable: "never", align: 'center' },
        { title: "Name", field: "name" },
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

    const [searchTerm, setSearchTerm] = useState('')
    const handleSearchInput = (event) => {
        let searchText = event.target.value
        setSearchTerm(searchText)

        let fiteredData = factoryList.filter((item) => {

            if (searchText === "") {
                return item
            }
            else if (item.name.toLowerCase().includes(searchText.toLowerCase())) {
                return item
            }
            else if (item.id.toLowerCase().includes(searchText.toLowerCase())) {
                return item
            }

        }
        )
        setFilteredFactoryList(fiteredData)
    }
    useEffect(() => {
        fetchFactoryList();
    }, []);

    const fetchFactoryList = async () => {
        try {
            setIsLoading(true);

            const factoriesRes = await FactoriesAPI.fetchFactories()

            if (factoriesRes && factoriesRes.data) {
                const clients = factoriesRes.data.map((x, index) => {
                    return {
                        id: x._id,
                        name: x.name,
                        created_by: x.author?.name,
                    }
                })
                setFactoryList(clients)
                setFilteredFactoryList(clients)
            }
            setIsLoading(false);

        } catch (error) {
            console.log('Error', error)
            setIsLoading(false);
            dispatch(showErrorAlert({ message: 'Unable to fetch factories' }));
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
        setSelectedFactoryId(rowId)
    }



    const handleSearchBar = (searchText, searchLabel) => {
        console.log(searchText, searchLabel)
        // const searchText = event.target.value;
        if (searchText.length == 0) {
            setFilteredFactoryList(factoryList);
        }
        else {
            setFilteredFactoryList(factoryList.filter(product => {
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


    const addFactory = (newData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    const data = {
                        name: newData.name,
                        author: isAuthenticated
                            ? user._id
                            : "Guest"
                    }; //

                    FactoriesAPI.upsertFactoryApi(data)
                        .then(res => {
                            if (res.data) {
                                dispatch(showSuccessAlert({ message: 'New factories added' }));

                                const updatedFactoryList = [
                                    { ...res.data, id: res.data._id },
                                    ...factoryList
                                ];
                                setFactoryList(updatedFactoryList);
                                const updatedFilteredList = [
                                    { ...res.data, id: res.data._id },
                                    ...filteredFactoryList
                                ];
                                setFilteredFactoryList(updatedFilteredList)

                            }
                        })
                        .catch(err => {
                            dispatch(showErrorAlert({ message: 'Unable to add factories' }));
                        });

                }
                resolve();
            }, 10);
        })
    }

    const updateFactory = (newData, oldData) => {

        return new Promise((resolve, reject) => {
            console.log("edit button")
            const data = {
                id: newData.id,
                name: newData.name,
                user: user._id
            }
            try {
                FactoriesAPI.upsertFactoryApi(data)
                    .then(res => {
                        if (res.data) {
                            dispatch(showSuccessAlert({ message: 'factories updated successfully' }));

                            const updatedFactoryList = factoryList.map(client => {
                                if (client.id === newData.id) {
                                    return { ...res.data, id: res.data._id }
                                }
                                else {
                                    return client
                                }
                            });

                            setFactoryList(updatedFactoryList);

                            const updatedFilteredList = filteredFactoryList.map(client => {
                                if (client.id === newData.id) {
                                    return { ...res.data, id: res.data._id }
                                }
                                else {
                                    return client
                                }
                            })
                            setFilteredFactoryList(updatedFilteredList)

                        }

                    })
                    .catch(err => {
                        dispatch(showErrorAlert({ message: 'Unable to update factories' }));
                    });

                resolve();

            } catch (error) {
                console.log('Error', error)
                reject(error)
            }
        })
    }

    const deleteClient = (oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    FactoriesAPI.deleteClientApi(oldData.id)
                        .then(res => {
                            const updatedFactoryList = factoryList.filter(client => client.id != oldData.id);
                            setFactoryList(updatedFactoryList)

                            const updatedFilteredFactoryList = filteredFactoryList.filter(client => client.id != oldData.id);
                            setFilteredFactoryList(updatedFilteredFactoryList)

                            dispatch(showSuccessAlert({ message: 'Factories removed successfully' }));
                        })
                        .catch(err => {
                            dispatch(showErrorAlert({ message: 'Unable to delete factories' }));
                        });
                }
                resolve();
            }, 1000);
        })
    }

    const toggleAddEditModal = () => {
        if (isAddEditModalOpened) {
            setSelectedListItem(null);
            setIsEditing(false);
        }
        setIsAddEditModalOpened(!isAddEditModalOpened)
    }
    const toggleEditModal = (factory) => {
        if (isAddEditModalOpened) {
            setSelectedFactoryId(null);
            setIsEditing(false)
        }
        else {
            setSelectedListItem(factory);
            setIsEditing(true)
        }
        setIsAddEditModalOpened(!isAddEditModalOpened)

    }


    const handleTableRowClick = (event) => history.push(`/factories/${event.id}`)

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
            title={'Factories'}
            selectedId={selectedFactoryId}
            handleHistoryToggle={handleHistoryToggle}
        >
            <AddEditFactoryModal
                title={'Factories'}
                isAddEditModalOpened={isAddEditModalOpened}
                toggleAddEditModal={toggleAddEditModal}
                fields={newColoumnsFields}
                updateFactory={isEditing ? updateFactory : addFactory}
                isEditing={isEditing}
                selectedValue={selectedListItem}

            />

            <Toolbar
                title={'Factories'}
                isGridViewSelected={isGridViewSelected}
                setIsGridViewSelected={setIsGridViewSelected}
                handleSearchBar={handleSearchBar}
                isDeletedItemVisible={isDeletedItemVisible}
                handleShowDelete={handleShowDelete}
                isHistoryModalOpened={isHistoryModalOpened}
                handleHistoryToggle={handleHistoryToggle}
                list={factoryList}
                filteredList={filteredFactoryList}
                setFilteredList={setFilteredFactoryList}
                columnsFields={columnsFields}
                isCustomAddButtonVisible={true}
                handleAddButtonPress={toggleAddEditModal}
                isSearchBarVisible={true}
                handleSearchInput={handleSearchInput}
            />

            {
                isGridViewSelected ?
                    <GridView
                        list={filteredFactoryList}
                        handleHistoryToggle={handleHistoryToggle}
                        columnsFields={columnsFields}
                        handleTableRowClick={handleTableRowClick}
                        isAddEditLinkVisible={true}
                        handleEditButtonPress={toggleEditModal}
                    /> :
                    <TableView
                        list={filteredFactoryList}
                        handleAdd={addFactory}
                        handleUpdate={updateFactory}
                        handleDelete={deleteClient}
                        columns={columns}
                        setColumns={setColumns}
                        handleTableRowClick={handleTableRowClick}
                    />

            }
        </DefaultContainer >
    );
}

export default Factories;
