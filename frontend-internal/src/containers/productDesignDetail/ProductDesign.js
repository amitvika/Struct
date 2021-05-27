import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom";

import API from '../../api/productDesign.api';
import { fetchClientsApi } from '../../api/clients.api';

import Toolbar from '../../components/Toolbar';
import GridView from '../../components/GridView';
import TableView from '../../components/TableView';
import DefaultContainer from '../../components/DefaultContainer'
import AddEditDesignModal from './AddEditDesignModal'

const ProductDesign = () => {
    let history = useHistory();

    const { isAuthenticated, user } = useSelector(state => state.auth);

    const [productDesignList, setProductDesignList] = useState([]);
    const [filteredProductDesignList, setFilteredProductDesignList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [snackBar, setSnackBar] = useState(false);
    const [snackBarAlertType, setSnackBarAlertType] = useState('');
    const [clientList, setClientList] = useState([]);
    const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
    const [selectedProductDesignId, setSelectedProductDesignId] = useState('');
    const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
    const [isGridViewSelected, setIsGridViewSelected] = useState(true);
    const [isAddEditModalOpened, setIsAddEditModalOpened] = useState(false);
    const [isEditing, setIsEditing] = useState(false)
    const [selectedListItem, setSelectedListItem] = useState(null);

    const columnsFields = { 'id': 'ID', 'name': 'Name', 'design_type': 'Design Type', 'updated_by': 'Updated By', 'created_by': 'Created By' };
    const newColoumnsFields = [
        { title: "ID", field: "id", editable: "never", align: 'center' },
        { title: "Name", field: "name", type: 'text' },
        //  { title: "Client", field: "Client" , type: 'select'}
    ]
    const [columns, setColumns] = useState([
        { title: "ID", field: "id", editable: "never", align: 'center' },
        { title: "Name", field: "name" },
        {
            title: "Design Type",
            field: "design_type"
        },
        {
            title: "Updated By",
            field: "updated_by"
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
    
    
    const [searchTerm, setSearchTerm] = useState('')
    const handleSearchInput = (event) => {
        let searchText = event.target.value
        setSearchTerm(searchText)

        let fiteredData = productDesignList.filter((item) => {

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
        setFilteredProductDesignList(fiteredData)
    }

    useEffect(() => {
        fetchClientList();
        fetchProductDesign();
    }, [])

    const fetchProductDesign = async () => {
        try {
            setIsLoading(true);

            const productRes = await API.getProductDesignApi();

            if (productRes && productRes.data) {
                const pd = productRes.data.map((x, index) => {
                    return {
                        id: x._id,
                        name: x.name,
                        // client: x.client._id,
                        // clientName: x.client.name,
                        created_by: x.createdBy.name,
                        deleted_at: x.deletedAt
                    }
                })

                setProductDesignList(pd)
                setFilteredProductDesignList(pd)
            }
            setIsLoading(false);

        } catch (error) {
            alertForError(error)
        }
    };

    const fetchClientList = async () => {
        try {
            const clientRes = await fetchClientsApi();
            if (clientRes && clientRes.data) {
                setClientList(clientRes.data)
            }

        } catch (error) {
            alertForError(error)
        }
    }

    const addProductDesign = (newData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    const newProcessGroup = {
                        name: newData.name,
                        client: newData.client,
                        user: isAuthenticated
                            ? user._id
                            : "Guest"
                    }; //

                    API.addProductDesignApi(newProcessGroup)
                        .then(res => {
                            fetchProductDesign();
                        })
                        .catch(err => {
                            alertForError(err)
                        });

                }
                resolve();
            }, 10);
        })
    }

    const updateProductDesign = (newData, oldData) => {
        new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    console.log(newData.client);
                    const data = {
                        name: newData.name,
                        user: user._id,
                        client: newData.client
                    }

                    API.updateProductDesignApi(newData.id, data)
                        .then(res => {
                            fetchProductDesign()
                        })
                   
                        .catch(err => {
                            alertForError(err)
                        });

                }
                resolve();
            }, 1000);
        })
    }

    const deleteProductDesign = (oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    API.deleteProductDesignApi(oldData.id)
                        .then(res => {
                            fetchProductDesign();
                        })
                        .catch(err => {
                            alertForError(err)
                        });
                }
                resolve();
            }, 1000);
        })
    }

    const alertForError = (err) => {
        setIsLoading(false);
        if (err.response && err.response.data) {
            setMessage(err.response.data.message);
            setSnackBarAlertType("error");
            setSnackBar(true);
        }
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
        //   }),
        //   () => this.retrieveFromDb()
        // );
    };

    const handleHistoryToggle = ({ rowId }) => {
        setIsHistoryModalOpened(!isHistoryModalOpened);
        setSelectedProductDesignId(rowId)
    }

    const handleTableRowClick = (event) => {
        // history.push(`/product-design/${event.id}?product_name=${event.name}`);
    }
    const toggleAddEditModal = () => {
        if (isAddEditModalOpened) {
            setIsEditing(false)
            setSelectedListItem(false)
        }
        setIsAddEditModalOpened(!isAddEditModalOpened)
    }
    const toggleEditModal = (product) => {
        if(isAddEditModalOpened) {
            setIsEditing(false) 
            setSelectedListItem(null) 
        }
        else {
            setIsEditing(true)
            setSelectedListItem(product)
        }
        setIsAddEditModalOpened(!isAddEditModalOpened)

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
            title={'ProcessGroup'}
            selectedId={selectedProductDesignId}
            handleHistoryToggle={handleHistoryToggle}
            snackBar={snackBar}
            handleAlertClose={handleAlertClose}
            message={message}
            snackBarAlertType={snackBarAlertType}
        >

            <AddEditDesignModal
                title={"Product Design"}
                toggleAddEditDesignModal={toggleAddEditModal}
                isAddEditDesignModalOpened={isAddEditModalOpened}
                updateProductDesign={isEditing ? updateProductDesign:addProductDesign}
                fields={newColoumnsFields}
                isEditing={isEditing}
                selectedValue={selectedListItem}
            />
            <Toolbar
                title={"Product Design"}
                isGridViewSelected={isGridViewSelected}
                setIsGridViewSelected={setIsGridViewSelected}
                isDeletedItemVisible={isDeletedItemVisible}
                handleShowDelete={handleShowDelete}
                isHistoryModalOpened={isHistoryModalOpened}
                handleHistoryToggle={handleHistoryToggle}
                clientList={clientList}
                list={productDesignList}
                filteredList={filteredProductDesignList}
                setFilteredList={setFilteredProductDesignList}
                columnsFields={columnsFields}
                isCustomAddButtonVisible={true}
                handleAddButtonPress={toggleAddEditModal}
                isSearchBarVisible={true}
                handleSearchInput={handleSearchInput}
            />

            {
                isGridViewSelected ?
                    <GridView
                        list={filteredProductDesignList}
                        handleHistoryToggle={handleHistoryToggle}
                        handleTableRowClick={handleTableRowClick}
                        columnsFields={columnsFields}
                        handleEditButtonPress={toggleEditModal}
                        isAddEditLinkVisible={true}
                    /> :
                    <TableView
                        title={"New Product Design"}
                        list={filteredProductDesignList}
                        clientList={clientList}
                        handleAdd={addProductDesign}
                        handleUpdate={updateProductDesign}
                        handleDelete={deleteProductDesign}
                        handleTableRowClick={handleTableRowClick}
                        columns={columns}
                        setColumns={setColumns}
                    />
            }
        </DefaultContainer >
    );
}

export default ProductDesign;
