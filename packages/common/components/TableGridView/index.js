import React, { useState } from 'react';

import TableView from './TableView';
import GridView from './GridView';
import Toolbar from './Toolbar';

import DefaultContainer from '../../components/DefaultContainer';
import CommonAddUpdateModal from './AddUpdateModal';
import get from 'lodash/get';
import TablePagination from '@mui/material/TablePagination';
import {
  getFromLocalStorage,
  saveToLocalStorage
} from '../../utils/usefulHelpers';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { Headding } from '..';

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
  isAddEditActionsEnabled = false,
  handleItemClick,
  showSuccessAlert = () => {},
  showErrorAlert = () => {},
  AdditionalFilter = null,
  handleAddButtonPress,
  isPaginationEnabled = false,
  isEditLinkVisible = true,
  isHistoryLinkVisible = true,
  noThumbnail = false,
  showDeleteActionButton = true,
  showHistoryButtonToolbar = true,
  showArchiveButtonToolbar = true,
  CustomAddButton,
  isChildItemTable = false
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
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    paginationValues.rowsPerPage || 25
  );
  const [totalDocs, setTotalDocs] = useState(0);

  const [isHistoryCheckboxVisible, setIsHistoryCheckboxVisible] =
    useState(false);

  React.useEffect(() => {
    fetchResult();
    saveToLocalStorage(`${title}-pagination`, { rowsPerPage });
  }, [page, rowsPerPage]);

  const fetchResult = (filterQS) => {
    let queryString = [];

    if (isPaginationEnabled) {
      queryString = [`page=${page}`, `limit=${rowsPerPage}`];
    }

    if (filterQS) {
      queryString.push(filterQS);
    }

    (async () => {
      try {
        setIsLoading(true);

        const res = await fetchList(queryString.join('&'));

        populateData(res);

        setIsLoading(false);
      } catch (error) {
        showErrorAlert({ message: `Unable to fetch ${title}` });
      }
    })();
  };

  const handleSearch = (queryString) => fetchResult(queryString);

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

  const handleTableRowClick = (data, openInTab) => {
    if (handleItemClick) {
      handleItemClick(data.id, data, openInTab);
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
          handleEditButtonPress={handleEditModal}
          handleDelete={handleDelete}
          handleUndeleteButton={handleUndeleteButton}
          isViewArchivedChecked={isViewArchivedChecked}
          {...{
            isHistoryLinkVisible,
            isEditLinkVisible,
            noThumbnail,
            showDeleteActionButton
          }}
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

  const handleFilter = (updatedList) => {
    setFilteredList(updatedList);
    setTotalDocs(updatedList.length);
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', position: 'absolute', left: 0, top: '60px' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (isChildItemTable && filteredList.length === 0) {
    return <Headding>No Child Items</Headding>;
  }

  return (
    <>
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
          setFilteredList={handleFilter}
          columnsFields={fields}
          isCustomAddButtonVisible={isCustomAddButtonVisible}
          handleAddButtonPress={handleToggleModal}
          isSearchBarVisible={true}
          AdditionalFilter={AdditionalFilter}
          {...{
            isHistoryCheckboxVisible,
            isEditLinkVisible,
            showHistoryButtonToolbar,
            showArchiveButtonToolbar,
            handleSearch,
            CustomAddButton
          }}
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
            <CustomTablePagination
              {...{
                page,
                totalDocs,
                rowsPerPage,
                handleChangePage,
                handleChangeRowsPerPage
              }}
            />
          )}
        </div>
        {renderView()}
      </DefaultContainer>
    </>
  );
};

// <TablePagination
//   component="div"
//   count={totalDocs}
//   page={page - 1}
//   onPageChange={handleChangePage}
//   rowsPerPage={rowsPerPage}
//   onRowsPerPageChange={handleChangeRowsPerPage}
//   rowsPerPageOptions={[10, 25, 50, 100]}
// />
const BootstrapSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    display: 'none'
  }
}));

const CustomTablePagination = ({
  page,
  totalDocs,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      Rows per page:
      <BootstrapSelect
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        value={rowsPerPage}
        onChange={handleChangeRowsPerPage}
      >
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={25}>25</MenuItem>
        <MenuItem value={30}>50</MenuItem>
        <MenuItem value={100}>100</MenuItem>
      </BootstrapSelect>
      <Pagination
        count={Math.ceil(totalDocs / 10)}
        page={page}
        onChange={handleChangePage}
      />
    </Box>
  );
};

const GridAndListSelector = ({ isGridViewSelected, setIsGridViewSelected }) => {
  return (
    <div style={{ display: 'inline-flex', padding: 10 }}>
      <Tooltip title="View Result in Grid View">
        <IconButton onClick={() => setIsGridViewSelected(true)} size="large">
          <GridViewIcon
            sx={{
              fontSize: 30,
              color: `${isGridViewSelected ? '#000000' : 'disabled'}`
            }}
          />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Result in Table View">
        <IconButton onClick={() => setIsGridViewSelected(false)} size="large">
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

export default React.memo(TableGridView);
