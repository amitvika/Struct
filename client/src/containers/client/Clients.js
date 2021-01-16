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

const Clients = () => {
	let history = useHistory();

	const { isAuthenticated, user } = useSelector(state => state.auth);

	const [clientList, setClientList] = useState([]);
	const [filteredClientList, setFilteredClientList] = useState([]);

	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [snackBar, setSnackBar] = useState(false);
	const [snackBarAlertType, setSnackBarAlertType] = useState('');
	const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
	const [selectedClientId, setSelectedClientId] = useState('');
	const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
	const [isGridViewSelected, setIsGridViewSelected] = useState(true);

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
						deleted_at: x.deletedAt
					}
				})
				setClientList(clients)
				setFilteredClientList(clients)
			}
			setIsLoading(false);

		} catch (error) {
			console.log(error)
			alertForError(error)
		}
	};

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
		// () => this.retrieveFromDb()
		// );
	};

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
							fetchClientList();
						})
						.catch(err => {
							alertForError(err)
						});

				}
				resolve();
			}, 10);
		})
	}

	const updateClient = (newData, oldData) => {
		new Promise((resolve, reject) => {
			setTimeout(() => {
				{
					console.log(newData.client);
					const data = {
						name: newData.name,
						user: user._id
					}

					API.updateClientApi(newData.id, data)
						.then(res => {
							fetchClientList()
						})
						.catch(err => {
							alertForError(err)
						});

				}
				resolve();
			}, 1000);
		})
	}

	const deleteClient = (oldData) => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				{
					API.deleteClientApi(oldData.id)
						.then(res => {
							fetchClientList();
						})
						.catch(err => {
							alertForError(err)
						});
				}
				resolve();
			}, 1000);
		})
	}

	const handleTableRowClick = (event) => history.push(`/clients/${event.id}`)

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
			title={'Client'}
			selectedId={selectedClientId}
			handleHistoryToggle={handleHistoryToggle}
			snackBar={snackBar}
			handleAlertClose={handleAlertClose}
			message={message}
			snackBarAlertType={snackBarAlertType}>

			<Toolbar
				title={'Client'}
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
			/>

			{
				isGridViewSelected ?
					<GridView
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

export default Clients;
