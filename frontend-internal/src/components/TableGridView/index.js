import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from "reactstrap";

import TableView from './TableView';
import GridView from './GridView';
import Toolbar from './Toolbar';

import DefaultContainer from '../../components/DefaultContainer'
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import CommonAddUpdateModal from './AddUpdateModal';
import get from 'lodash/get';

const TableGridView = ({
	title,
	fields = [],
	fetchList,
	upsertListItem = () => { },
	ManageTeamModal,
	AddUpdateModal = CommonAddUpdateModal,
	isManageTeamAvailable = false,
	isCustomAddButtonVisible = true
}) => {
	const dispatch = useDispatch();

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
				setFilteredList(mappedList)

				setIsLoading(false);

			} catch (error) {
				dispatch(showErrorAlert({ message: `Unable to fetch ${title}` }));
			}
		})()
	}, []);


	const handleViewArchived = () => {
		setIsViewArchivedChecked(!isViewArchivedChecked)
	};

	const handleHistoryToggle = ({ rowId }) => {
		setIsHistoryModalOpened(!isHistoryModalOpened);
		// setselectedListItem(rowId)
	}


	const handleSearchBar = (searchText, searchLabel) => {
		console.log(searchText, searchLabel)
		// const searchText = event.target.value;
		if (searchText.length == 0) {
			setFilteredList(list);
		}
		else {
			setFilteredList(list.filter(product => {
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


	const handleUpdate = (value) => {

		upsertListItem(value)
			.then(res => {
				if (res.data) {
					dispatch(showSuccessAlert({ message: `${title} updated` }));

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
				dispatch(showErrorAlert({ message: `Unable to update ${title}` }));
			});
	}

	const handleTableRowClick = (data) => {
		setSelectedListItem(data);

		if (isManageTeamAvailable) {
			setIsManageTeamModalOpened(true);
			return
		}

		setIsEditing(true);
		handleToggleModal();
	}

	const handleToggleModal = () => {
		if (isModalOpened) {
			setSelectedListItem(null);
			setIsEditing(false);
		}
		setIsModalOpened(!isModalOpened)
	}

	const renderView = () => {
		if (isGridViewSelected) {
			return (
				<GridView
					list={getFilteredList()}
					handleHistoryToggle={handleHistoryToggle}
					columnsFields={fields}
					handleTableRowClick={handleTableRowClick}
				/>
			)
		}
		else {
			return (

				<TableView
					list={getFilteredList()}
					columns={fields}
					handleTableRowClick={handleTableRowClick}
					isActionHidden={true}
				/>
			)
		}
	}

	const getFilteredList = () => {
		return filteredList.filter(item => {
			// console.log(isViewArchivedChecked, item.is_archived)
			if (isViewArchivedChecked == item.is_archived) {
				return true;
			}
			return false
		});
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
			title={title}
			isHistoryModalOpened={isHistoryModalOpened}
			selectedId={selectedListItem}
			handleHistoryToggle={handleHistoryToggle}
		>
			{ isModalOpened && selectedListItem && <AddUpdateModal
				title={title}
				fields={fields}
				open={isModalOpened}
				toggleModal={handleToggleModal}
				handleUpdate={handleUpdate}
				isEditing={isEditing}
				selectedValue={selectedListItem}
			/>}

			{
				isManageTeamAvailable && selectedListItem &&
				<ManageTeamModal
					open={isManageTeamModalOpened}
					toggleModal={() => setIsManageTeamModalOpened(!isManageTeamModalOpened)}
					selectedValue={selectedListItem}
					handleUpdate={handleUpdate}
				/>
			}
			<Toolbar
				title={title}
				isGridViewSelected={isGridViewSelected}
				setIsGridViewSelected={setIsGridViewSelected}
				handleSearchBar={handleSearchBar}
				isViewArchivedChecked={isViewArchivedChecked}
				handleViewArchived={handleViewArchived}
				isHistoryModalOpened={isHistoryModalOpened}
				handleHistoryToggle={handleHistoryToggle}
				list={list}
				filteredList={getFilteredList()}
				setFilteredList={setFilteredList}
				columnsFields={fields}
				isCustomAddButtonVisible={isCustomAddButtonVisible}
				handleAddButtonPress={handleToggleModal}
			/>

			{renderView()}
		</DefaultContainer >
	);
}

export default TableGridView;
