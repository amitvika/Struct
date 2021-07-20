import React, { useState, useEffect } from "react";

import TableView from './TableView';
import GridView from './GridView';
import Toolbar from './Toolbar';

import DefaultContainer from '../../components/DefaultContainer';
import CommonAddUpdateModal from './AddUpdateModal';
import Backdrop from '../Backdrop';
import get from 'lodash/get';

const TableGridView = ({
    title,
    fields = [],
    fetchList,
    upsertListItem = () => { },
    ManageTeamModal,
    isDesignModalOpened=true,
    AddUpdateModal = CommonAddUpdateModal,
    isManageTeamVisible = false,
    isCustomAddButtonVisible = true,
    isAddEditLinkVisible = true,
    isAddEditActionsEnabled = false,
    handleItemClick,
    showSuccessAlert = () => { },
    showErrorAlert = () => { }
}) => {
    
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);

    const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
    const [isViewArchivedChecked, setIsViewArchivedChecked] = useState(false);
    const [isGridViewSelected, setIsGridViewSelected] = useState(true);
    const [isModalOpened, setIsModalOpened] = useState(false);
    const [selectedListItem, setSelectedListItem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isManageTeamModalOpened, setIsManageTeamModalOpened] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);

                const res = await fetchList()

                const mappedList = get(res, 'data', []);


                setList(mappedList)
                setFilteredList(mappedList.filter(item => !item.is_archived))

                setIsLoading(false);

            } catch (error) {
                showErrorAlert({ message: `Unable to fetch ${title}` });
            }
        })()
    }, []);


    const handleViewArchived = () => {
        if (isViewArchivedChecked) {
            setFilteredList(list.filter(item => !item.is_archived));
        }
        else {
            setFilteredList(list.filter(item => item.is_archived));
        }

        setIsViewArchivedChecked(!isViewArchivedChecked);
    };

    const handleHistoryToggle = ({ rowId }) => {
        setIsHistoryModalOpened(!isHistoryModalOpened);
        // setselectedListItem(rowId)
    }

    const upsertItem = (value) => {

        return upsertListItem(value)
            .then(res => {
                if (res.data) {
                    showSuccessAlert({ message: `${title} updated` });

                    const availableDoc = list.find(document => document.id == res.data.id);

                    if (availableDoc) {
                        const updatedList = list.map(document => {
                            if (document.id === res.data.id) {
                                return { ...res.data, id: res.data.id }
                            }
                            return document
                        })

                        setList(updatedList);

                        setFilteredList(updatedList)
                    }
                    else {
                        const updatedList = [
                            { ...res.data, id: res.data.id },
                            ...list
                        ];
                        setList(updatedList);

                        setFilteredList(updatedList)
                    }

                }

                setIsEditing(false)
            })
            .catch(err => {
                showErrorAlert({ message: `Unable to update ${title}` });
            });
    }

    const handleAdd = (newData) => {
        return upsertItem(newData)
    }

    const handleUpdate = (newData, oldData) => {
        return upsertItem(newData)
    }

    const handleDelete = (oldData) => {
        let updateValue = { ...oldData, is_archived: true }
        return upsertItem(updateValue)
    }

    const handleTableRowClick = (data) => {
        if (handleItemClick) {
            handleItemClick(data.id, data);
            return;
        }

        setSelectedListItem(data);

        if (isManageTeamVisible) {
            setIsManageTeamModalOpened(true);
            return
        }
        // setIsManageTeamModalOpened(true);

        // setIsEditing(true);
        setIsModalOpened(!isModalOpened)
    }

    const handleToggleModal = () => {
        if (isModalOpened) {
            setSelectedListItem(null);
            setIsEditing(false);
        }
        setIsModalOpened(!isModalOpened)
    }
    const handleEditModal = (item) => {
        if (isModalOpened) {
            setSelectedListItem(null);
            setIsEditing(false)
        }
        else {
            setSelectedListItem(item)
            setIsEditing(true)
        }
        setIsModalOpened(!isModalOpened);
    }

    const renderView = () => {
        if (isGridViewSelected) {
            return (
                <GridView
                    list={filteredList}
                    handleHistoryToggle={handleHistoryToggle}
                    columnsFields={fields}
                    handleTableRowClick={handleTableRowClick}
                    // toggleModal={handleEditModal}
                    handleEditButtonPress={handleEditModal} 
                    isAddEditLinkVisible={true}
                    />
            )
        }
        else {
            return (
                <TableView
                    list={filteredList}
                    columns={fields}
                    handleTableRowClick={handleTableRowClick}
                    isAddEditActionsEnabled={isAddEditActionsEnabled}
                    handleAdd={handleAdd}
                    handleDelete={handleDelete}
                    handleUpdate={handleUpdate}
                />
            )
        }
    }


    const handleTeamModalToggle = () => {
        if (isManageTeamModalOpened) {
            setSelectedListItem(null);
            setIsEditing(false);
        }
        setIsManageTeamModalOpened(!isManageTeamModalOpened);
    }

    return (
        <>
            <Backdrop isLoading={isLoading} />
            <DefaultContainer
                title={title}
                isHistoryModalOpened={isHistoryModalOpened}
                selectedId={selectedListItem}
                handleHistoryToggle={handleHistoryToggle}
            >
                {isModalOpened && <AddUpdateModal
                    title={isEditing ? "" : title}
                    fields={fields}
                    open={isModalOpened}
                    toggleModal={handleToggleModal}
                    handleUpdate={handleUpdate}
                    isEditing={isEditing}
                    selectedValue={selectedListItem}
                    isDesignModalOpened={isDesignModalOpened}
                />}
                {
                    isManageTeamVisible &&
                    <ManageTeamModal
                        open={isManageTeamModalOpened}
                        toggleModal={handleTeamModalToggle}
                        selectedValue={selectedListItem}
                        handleUpdate={handleUpdate}
                    />
                }
                <Toolbar
                    title={title}
                    isGridViewSelected={isGridViewSelected}
                    setIsGridViewSelected={setIsGridViewSelected}
                    isViewArchivedChecked={isViewArchivedChecked}
                    handleViewArchived={handleViewArchived}
                    isHistoryModalOpened={isHistoryModalOpened}
                    handleHistoryToggle={handleHistoryToggle}
                    list={list}
                    filteredList={filteredList}
                    setFilteredList={setFilteredList}
                    columnsFields={fields}
                    isCustomAddButtonVisible={isCustomAddButtonVisible}
                    isAddEditLinkVisible={isAddEditLinkVisible}
                    handleAddButtonPress={handleToggleModal}
                    // handleAddButtonPress={() => console.log("----handleAddButtonPress")}
                    isSearchBarVisible={true}
                />

                {renderView()}
            </DefaultContainer >
        </>
    );
}

export default TableGridView;
