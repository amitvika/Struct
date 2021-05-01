import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom";

import API from '../../api/items.api';

import Toolbar from '../../components/Toolbar';
import GridView from '../../components/GridView';
import TableView from '../../components/TableView';
import DefaultContainer from '../../components/DefaultContainer';

import { columnsFields } from '../../constants/item'

const Items = () => {
	let history = useHistory();

	const { isAuthenticated, user } = useSelector(state => state.auth);

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
						assemblyType: item.assemblyType
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

	const handleHistoryToggle = ({ rowId }) => {
		setIsHistoryModalOpened(!isHistoryModalOpened);
		setSelectedItemId(rowId)
	}

	const handleTableRowClick = (event) => {
		history.push(`/items/${event.id}`)
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
			title={'Item'}
			selectedId={selectedItemId}
			handleHistoryToggle={handleHistoryToggle}
			snackBar={snackBar}
			handleAlertClose={handleAlertClose}
			message={message}
			snackBarAlertType={snackBarAlertType}>

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
			/>

			{
				isGridViewSelected ?
					<GridView
						list={filteredItemList}
						handleHistoryToggle={handleHistoryToggle}
						columnsFields={columnsFields}
						handleTableRowClick={handleTableRowClick}
					/> :
					<TableView
						title={"Items"}
						list={filteredItemList}
						handleTableRowClick={handleTableRowClick}
						columns={columns}
						setColumns={setColumns}
						isActionHidden={true}
					/>

			}
		</DefaultContainer>
	);
}

export default Items;
