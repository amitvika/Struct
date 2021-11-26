import React, { useState, useEffect } from 'react';

import TableView from './TableView';
import GridView from './GridView';
import Toolbar from './Toolbar';

import DefaultContainer from '../../components/DefaultContainer';
import CommonAddUpdateModal from './AddUpdateModal';
import LoadingModal from '../LoadingModal';
import get from 'lodash/get';
import TablePagination from '@material-ui/core/TablePagination';
import {
  getFromLocalStorage,
  saveToLocalStorage
} from '../../utils/usefulHelpers';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@mui/material/Tooltip';

const TableGridView = ({
  title,
  fields = [],
  fetchList,
  upsertListItem = () => {},
  ManageTeamModal,
  isDesignModalOpened = true,
  AddUpdateModal = CommonAddUpdateModal,
  isManageTeamVisible = false,
  isCustomAddButtonVisible = true,
  isAddEditLinkVisible = true,
  isAddEditActionsEnabled = false,
  handleItemClick,
  showSuccessAlert = () => {},
  showErrorAlert = () => {},
  AdditionalFilter = null,
  handleAddButtonPress,
  isPaginationEnabled = false
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

  const paginationValues = getFromLocalStorage(`${title}-pagination`) || {};
  const [page, setPage] = React.useState(paginationValues.page || 1);
  const [rowsPerPage, setRowsPerPage] = React.useState(
    paginationValues.rowsPerPage || 100
  );
  const [totalDocs, setTotalDocs] = React.useState(0);

  const [isHistoryCheckboxVisible, setIsHistoryCheckboxVisible] =
    useState(false);

  useEffect(() => {
    fetchResult();
    saveToLocalStorage(`${title}-pagination`, { page, rowsPerPage });
  }, [page, rowsPerPage]);

  const fetchResult = () => {
    let queryString = '';

    if (isPaginationEnabled) {
      queryString = `page=${page}&limit=${rowsPerPage}`;
    }

    (async () => {
      try {
        setIsLoading(true);

        const res = await fetchList(queryString);

        populateData(res);

        setIsLoading(false);
      } catch (error) {
        showErrorAlert({ message: `Unable to fetch ${title}` });
      }
    })();
  };

  const populateData = (res) => {
    let mappedList = get(res, 'data', []);

    if (isPaginationEnabled) {
      mappedList = get(res, 'data.docs', []);
      setTotalDocs(get(res, 'data.totalDocs', 0));
    }

    setList(mappedList);
    setFilteredList(mappedList.filter((item) => !item.is_archived));
  };

  const handleViewArchived = () => {
    if (isViewArchivedChecked) {
      setFilteredList(list.filter((item) => !item.is_archived));
    } else {
      setFilteredList(list.filter((item) => item.is_archived));
    }

    setIsViewArchivedChecked(!isViewArchivedChecked);
  };

  const handleHistoryToggle = ({ rowId }) => {
    setIsHistoryModalOpened(!isHistoryModalOpened);
    // setselectedListItem(rowId)
  };

  const upsertItem = (value) => {
    setIsLoading(true);
    return upsertListItem(value)
      .then((res) => {
        if (res.data) {
          showSuccessAlert({ message: `${title} updated` });

          const availableDoc = list.find(
            (document) => document.id == res.data.id
          );

          if (availableDoc) {
            let updatedList = list.map((document) => {
              if (document.id === res.data.id) {
                return { ...res.data, id: res.data.id };
              }
              return document;
            });

            // updatedList = updatedList.filter((item) => !item.is_archived);

            if (isViewArchivedChecked) {
              setFilteredList(updatedList.filter((item) => item.is_archived));
            } else {
              setFilteredList(updatedList.filter((item) => !item.is_archived));
            }
            setList(updatedList);

            // setFilteredList(updatedList);
          } else {
            const updatedList = [{ ...res.data, id: res.data.id }, ...list];
            setList(updatedList);

            setFilteredList(updatedList);
          }
        }

        setIsEditing(false);
        setIsLoading(false);

        return res.data;
      })
      .catch((err) => {
        showErrorAlert({ message: `Unable to update ${title}` });
        setIsLoading(false);
      });
  };

  const handleAdd = (newData) => {
    return upsertItem(newData);
  };

  const handleUpdate = (newData, oldData) => {
    if (selectedListItem) {
      return upsertItem({ ...newData, id: selectedListItem.id });
    } else {
      return upsertItem({ ...newData });
    }
  };

  const handleDelete = (oldData) => {
    let updateValue = { ...oldData, is_archived: true };
    return upsertItem(updateValue);
  };

  const handleUndeleteButton = (oldData) => {
    let updateValue = { ...oldData, is_archived: false };
    return upsertItem(updateValue);
  };

  const handleTableRowClick = (data) => {
    if (handleItemClick) {
      handleItemClick(data.id, data);
      return;
    }

    setSelectedListItem(data);

    if (isManageTeamVisible) {
      setIsManageTeamModalOpened(true);
      return;
    }
    setIsModalOpened(!isModalOpened);
  };

  const handleToggleModal = () => {
    if (handleAddButtonPress) {
      return handleAddButtonPress();
    }
    if (isModalOpened) {
      setSelectedListItem(null);
      setIsEditing(false);
    }
    setIsModalOpened(!isModalOpened);
  };

  const handleEditModal = (item) => {
    if (isModalOpened) {
      setSelectedListItem(null);
      setIsEditing(false);
    } else {
      setSelectedListItem(item);
      setIsEditing(true);
    }
    setIsModalOpened(!isModalOpened);
  };

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
          handleDelete={handleDelete}
          handleUndeleteButton={handleUndeleteButton}
          isViewArchivedChecked={isViewArchivedChecked}
        />
      );
    } else {
      return (
        <TableView
          list={filteredList}
          columns={fields}
          handleTableRowClick={handleTableRowClick}
          isAddEditActionsEnabled={isAddEditActionsEnabled}
          handleAdd={handleAdd}
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
          {...{ handleHistoryToggle }}
        />
      );
    }
  };

  const handleTeamModalToggle = () => {
    if (isManageTeamModalOpened) {
      setSelectedListItem(null);

      setIsEditing(false);
    }
    setIsManageTeamModalOpened(!isManageTeamModalOpened);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <LoadingModal isLoading={isLoading} />
      <DefaultContainer
        title={title}
        isHistoryModalOpened={isHistoryModalOpened}
        selectedId={selectedListItem}
        handleHistoryToggle={handleHistoryToggle}
      >
        {isModalOpened && !handleAddButtonPress && (
          <AddUpdateModal
            title={isEditing ? '' : title}
            fields={fields}
            open={isModalOpened}
            toggleModal={handleToggleModal}
            handleUpdate={handleUpdate}
            isEditing={isEditing}
            selectedValue={selectedListItem}
            isDesignModalOpened={isDesignModalOpened}
            dataList={list}
          />
        )}
        {isManageTeamVisible && (
          <ManageTeamModal
            open={isManageTeamModalOpened}
            toggleModal={handleTeamModalToggle}
            selectedValue={selectedListItem}
            handleUpdate={handleUpdate}
          />
        )}
        <Toolbar
          title={title}
          isViewArchivedChecked={isViewArchivedChecked}
          handleViewArchived={handleViewArchived}
          isHistoryModalOpened={isHistoryModalOpened}
          handleHistoryToggle={(data) => {
            setIsHistoryCheckboxVisible((prev) => !prev);
            handleHistoryToggle(data);
          }}
          list={list}
          filteredList={filteredList}
          setFilteredList={setFilteredList}
          columnsFields={fields}
          isCustomAddButtonVisible={isCustomAddButtonVisible}
          isAddEditLinkVisible={isAddEditLinkVisible}
          handleAddButtonPress={handleToggleModal}
          isSearchBarVisible={true}
          AdditionalFilter={AdditionalFilter}
          {...{ isHistoryCheckboxVisible }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          <GridAndListSelector
            {...{
              isGridViewSelected,
              setIsGridViewSelected
            }}
          />
          {isPaginationEnabled && (
            <TablePagination
              component="div"
              count={totalDocs}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </div>
        {renderView()}
      </DefaultContainer>
    </>
  );
};

const GridAndListSelector = ({ isGridViewSelected, setIsGridViewSelected }) => {
  return (
    <div style={{ display: 'inline-flex', padding: 10 }}>
      <Tooltip title="View Result in Grid View">
        <IconButton onClick={() => setIsGridViewSelected(true)}>
          <GridViewIcon
            sx={{
              fontSize: 30,
              color: `${isGridViewSelected ? '#000000' : 'disabled'}`
            }}
          />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Result in Table View">
        <IconButton onClick={() => setIsGridViewSelected(false)}>
          <ViewListIcon
            sx={{
              fontSize: 30,
              color: `${isGridViewSelected ? 'disabled' : '#000000'}`
            }}
          />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default TableGridView;
