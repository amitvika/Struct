import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom";

import API from '../../api/vendor.api';
import Toolbar from '../../components/Toolbar';
import TableView from '../../components/TableView';
import GridView from '../../components/GridView';
import DefaultContainer from '../../components/DefaultContainer';
import AddEditVendorModal from './AddEditVendorModal'

import { useDispatch } from 'react-redux';
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';

const Vendors = () => {
    let history = useHistory();

    const dispatch = useDispatch();

    const [vendorList, setVendorList] = useState([]);
    const [filteredVendorList, setFilteredVendorList] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [snackBar, setSnackBar] = useState(false);
    const [snackBarAlertType, setSnackBarAlertType] = useState('');
    const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState('');
    const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
    const [isGridViewSelected, setIsGridViewSelected] = useState(true);
    const [isAddEditVendorModalOpened, setIsAddEditVendorModalOpened] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedListItem, setSelectedListItem] = useState(null);


    const [columns, setColumns] = useState([
        { title: "ID", field: "id", editable: "never", align: 'center' },
        { title: "Name", field: "name" },
        // { title: "Source", field: "source" },
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
    const columnsFields = { 'id': 'ID', 'name': 'Name' };
    const newColoumnsFields = [
        { title: "ID", field: "id", editable: "never", align: 'center' },
        { title: "Name", field: "name", type: 'text' },
    ]

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
        setSelectedVendorId(rowId)
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
        fetchVendorList();
    }, []);

    const fetchVendorList = async () => {
        try {
            setIsLoading(true);

            const vendorRes = await API.getVendorsApi();

            if (vendorRes && vendorRes.data) {
                const vendors = vendorRes.data.map((x, index) => {
                    return {
                        id: x._id,
                        name: x.name,
                        source: x.source,
                        logoUrl: x.logoUrl
                    }
                })

                setVendorList(vendors)
                setFilteredVendorList(vendors)
            }
            setIsLoading(false);

        } catch (error) {
            console.log(error)
            alertForError(error)
        }
    };


    const fetchList = (query) => {
        API
            .getVendorsApi(`limit=${query.pageSize}&page=${query.page + 1}&search=${query.search}`)
            .then(result => {
                let rowData = result.docs;

                rowData = rowData.map((item, index) => {
                    return {
                        id: item._id,
                        name: item.name,
                        source: item.source
                    };
                });

            })
            .catch(err => console.log(err));

    }


    const addVendor = (newData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    const newClient = {
                        name: newData.name,
                        source: newData.source
                    }; //

                    API.addVendorApi(newClient)
                        .then(res => {
                            fetchVendorList();
                        })
                        .catch(err => {
                            alertForError(err)
                        });

                }
                resolve();
            }, 10);
        })
    }

    const updateVendor = (newData, oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    console.log(newData.client);
                    const data = {
                        name: newData.name,
                        source: newData.source
                    }

                    API.updateVendorApi(newData.id, data)
                        .then(res => {
                            fetchVendorList()
                        })
                        setIsEditing(false)
                        .catch(err => {
                            alertForError(err)
                        });

                }
                resolve();
            }, 1000);
        })
    }

    const deleteVendor = (oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    API.deleteVendorApi(oldData.id)
                        .then(res => {
                            fetchVendorList();
                        })
                        .catch(err => {
                            alertForError(err)
                        });
                }
                resolve();
            }, 1000);
        })
    }
    const toggleAddEditVendorModal = () => {
        if (isAddEditVendorModalOpened) {
            setSelectedListItem(null);
            setIsEditing(false);
        }
        setIsAddEditVendorModalOpened(!isAddEditVendorModalOpened)
    }

    const handleTableRowClick = (event) => {
        history.push(`/vendors/${event.id}`);
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
            title={'Vendors'}
            selectedId={selectedVendorId}
            handleHistoryToggle={handleHistoryToggle}
            snackBar={snackBar}
            handleAlertClose={handleAlertClose}
            message={message}
            snackBarAlertType={snackBarAlertType}>

            <AddEditVendorModal
                title={"Add Vendor"}
                isAddEditVendorModalOpened={isAddEditVendorModalOpened}
                toggleAddEditVendorModal={toggleAddEditVendorModal}
                addVendor={addVendor}
                fields={newColoumnsFields}
                isEditing={isEditing}
                selectedValue={selectedListItem}

            />

            <Toolbar
                title={'Vendors'}
                isGridViewSelected={isGridViewSelected}
                setIsGridViewSelected={setIsGridViewSelected}
                // handleSearchBar={handleSearchBar}
                isDeletedItemVisible={isDeletedItemVisible}
                handleShowDelete={handleShowDelete}
                isHistoryModalOpened={isHistoryModalOpened}
                handleHistoryToggle={handleHistoryToggle}
                list={vendorList}
                filteredList={filteredVendorList}
                setFilteredList={setFilteredVendorList}
                columnsFields={columnsFields}
                isCustomAddButtonVisible={true}
                handleAddButtonPress={toggleAddEditVendorModal}
            />

            {
                isGridViewSelected ?
                    <GridView
                        list={filteredVendorList}
                        handleHistoryToggle={handleHistoryToggle}
                        columnsFields={columnsFields}
                        handleTableRowClick={handleTableRowClick} /> :
                    <TableView
                        list={filteredVendorList}
                        handleAdd={addVendor}
                        handleUpdate={updateVendor}
                        handleDelete={deleteVendor}
                        handleTableRowClick={handleTableRowClick}
                        columns={columns}
                        setColumns={setColumns}

                    />
            }
        </DefaultContainer>
    );
}

export default Vendors;
