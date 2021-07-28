import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import API from '@ravibasil/common/api/items.api';
import Toolbar from '@ravibasil/common/components/TableGridView/Toolbar';
import GridView from '@ravibasil/common/components/TableGridView/GridView';
import TableView from '@ravibasil/common/components/TableGridView/TableView';
import DefaultContainer from '@ravibasil/common/components/DefaultContainer';
import LoadingModal from '@ravibasil/common/components/LoadingModal';

import { columnsFields } from '@ravibasil/common/constants/item'
import AddEditItemModal from './AddEditItemModel';
import { resourcePathURL } from '@ravibasil/common/api/fileUpload.api';

const Items = ({ handleSave }) => {
    let history = useHistory();

    const [itemList, setItemList] = useState([]);
    const [filteredItemList, setFilteredItemList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [snackBar, setSnackBar] = useState(false);
    const [snackBarAlertType, setSnackBarAlertType] = useState('');
    const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState('');
    const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
    const [isGridViewSelected, setIsGridViewSelected] = useState(true);
    const [isAddEditItemModalOpened, setIsAddEditItemModalOpened] = useState(false);
    const [isEditing, setIsEditing] = useState(false)
    const [selectedListItem, setSelectedListItem] = useState(null)

    const [columns, setColumns] = useState([
        { title: "ID", field: "id", editable: "never" },
        { title: "Name", field: "name" },
        {
            title: "Source", field: "source"
        },
        {
            title: 'Assembly',
            field: 'assemblyType',
            lookup: { "Single Item Part": "Single Item Part", "Multi-Item Assembly": "Multi-Item Assembly" }
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
        }
    ])
    const [searchTerm, setSearchTerm] = useState('')
    const handleSearchInput = (event) => {
        let searchText = event.target.value
        setSearchTerm(searchText)

        let fiteredData = itemList.filter((item) => {

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
        setFilteredItemList(fiteredData)
    }

    useEffect(() => {
        fetchItems();
    }, [])

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
        //   })
        // );
    };

    const fetchItems = async (query) => {
        try {
            setIsLoading(true);

            const itemRes = await API.getItemsAPI();

            if (itemRes && itemRes.data) {
                const items = itemRes.data.map((item, index) => {
                    return {
                        id: item._id,
                        name: item.name,
                        source: item?.vendorId?.name || 'STRUCT',
                        assemblyType: item.assemblyType,
                        file_url: item.fileStore ? resourcePathURL+item.fileStore+".png" : undefined
                    }
                })

                setItemList(items)
                setFilteredItemList(items)
            }
            setIsLoading(false);

        } catch (error) {
            alertForError(error)
        }
    }

    const addItem = (newData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    const newItem = {
                        name: newData.name,
                        source: newData
                    };
                    API.addItemApi(newItem)
                        .then(res => {
                            fetchItems();
                        })
                        .catch(err => {
                            alertForError(err)
                        })
                }
                resolve();
            }, 10)
        })
    }

    const updateItem = (newData, oldData) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                {
                    console.log(newData.item);
                    const data = {
                        name: newData.name,
                        source: newData.source
                    }

                    API.updateItemAPI(newData.id, data)
                        .then(res => {
                            fetchItems()
                        })
                        .catch(err => {
                            alertForError(err)
                        });

                }
                resolve();
            }, 1000);
        })
    }




    const handleHistoryToggle = ({ rowId }) => {
        setIsHistoryModalOpened(!isHistoryModalOpened);
        setSelectedItemId(rowId)
    }

    const handleTableRowClick = (event) => {
        history.push(`/items/${event.id}`)
    }

    // if (isLoading) {
    //     return (<div
    //         style={{
    //             display: "flex",
    //             justifyContent: "center"
    //         }}
    //     >
    //         <Spinner animation="border" />
    //     </div>)
    // }

    const toggleAddItemModal = () => {
        if (isAddEditItemModalOpened) {
            setIsEditing(false);
            setSelectedListItem(null);
        }
        setIsAddEditItemModalOpened(!isAddEditItemModalOpened)
    }

    const toggleEditItemModal = (item) => {
        if (isAddEditItemModalOpened) {
            setIsEditing(false);
            setSelectedListItem(null);
        }
        else {
            setSelectedListItem(item);
            setIsEditing(true);
        }
        setIsAddEditItemModalOpened(!isAddEditItemModalOpened)

    }

    return (

        <DefaultContainer
            isHistoryModalOpened={isHistoryModalOpened}
            title={'Item'}
            selectedId={selectedItemId}
            handleHistoryToggle={handleHistoryToggle}
            snackBar={snackBar}
            handleAlertClose={handleAlertClose}
            message={message}
            snackBarAlertType={snackBarAlertType}>
            <LoadingModal isLoading={isLoading} />

            {isAddEditItemModalOpened && <AddEditItemModal
                title={isEditing ? "" : "Item"}
                isAddEditItemModalOpened={isAddEditItemModalOpened}
                toggleAddEditItemModal={toggleAddItemModal}
                updateItem={isEditing ? updateItem : addItem}
                fields={columnsFields}
                isEditing={isEditing}
                selectedValue={selectedListItem}
            />}
            <Toolbar
                title={"Items"}
                isGridViewSelected={isGridViewSelected}
                setIsGridViewSelected={setIsGridViewSelected}
                isDeletedItemVisible={isDeletedItemVisible}
                handleShowDelete={handleShowDelete}
                isHistoryModalOpened={isHistoryModalOpened}
                handleHistoryToggle={handleHistoryToggle}
                list={itemList}
                filteredList={filteredItemList}
                setFilteredList={setFilteredItemList}
                columnsFields={columnsFields}
                isCustomAddButtonVisible={true}
                handleAddButtonPress={toggleAddItemModal}
                isSearchBarVisible={true}
                handleSearchInput={handleSearchInput}
            />

            {
                isGridViewSelected ?
                    <GridView
                        list={filteredItemList}
                        handleHistoryToggle={handleHistoryToggle}
                        columnsFields={columnsFields}
                        handleTableRowClick={handleTableRowClick}
                        isAddEditLinkVisible={true}
                        handleEditButtonPress={toggleEditItemModal}
                    /> :
                    <TableView
                        addItem={addItem}
                        title={"Items"}
                        list={filteredItemList}
                        handleTableRowClick={handleTableRowClick}
                        columns={columns}
                        setColumns={setColumns}
                        isAddEditActionsEnabled={false}
                    />

            }
        </DefaultContainer>
    );
}

export default Items;
