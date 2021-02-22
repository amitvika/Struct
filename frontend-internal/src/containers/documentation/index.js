import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom";
import TableView from '../../components/TableView';
import GridView from '../../components/GridView';
import DefaultContainer from '../../components/DefaultContainer'
import DocumentationAPI from '../../api/documentation.api';
import { documentationColumnsFields } from '../../constants/client'
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { mapDocumentations } from '../../utils/mapper';
import Toolbar from '../../components/Toolbar';
import AddEditDocumentationModal from './AddEditDocumentationModal';
import get from 'lodash/get';

const Documentation = () => {
	let history = useHistory();
	const dispatch = useDispatch();

	const { isAuthenticated, user } = useSelector(state => state.auth);

	const [documentationList, setDocumentationList] = useState([]);
	const [filteredDocumentationList, setFilteredDocumentationList] = useState([]);

	const [isLoading, setIsLoading] = useState(false);

	const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
	const [selectedClientId, setSelectedClientId] = useState('');
	const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
	const [isGridViewSelected, setIsGridViewSelected] = useState(true);

	const [isModalOpened, setIsModalOpened]= useState(false);

	const [columns, setColumns] = useState([
		{ title: "ID", field: "id", editable: "never", align: 'center' },
		{ title: "Name", field: "name" },
		{
			title: "Category",
			field: "category",
			editable: "never"
		},
		{
			title: "Note",
			field: "note",
			editable: "never"
		},
		{
			title: "File Uploaded",
			field: "file_upload",
			editable: "never"
		},
		{
			title: "Created By",
			field: "created_by",
			editable: "never"
		},
		{
			title: "Updated By",
			field: "updated_By",
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
		fetchDocumentations();
	}, []);

	const fetchDocumentations = async () => {
		try {
			setIsLoading(true);

			const res = await DocumentationAPI.fetchDocumentations(``)
			const documentations = mapDocumentations(get(res, 'data', []));

			setDocumentationList(documentations)
			setFilteredDocumentationList(documentations)

			setIsLoading(false);

		} catch (error) {
			console.log('----->>Error', error)
			dispatch(showErrorAlert({ message: 'Unable to fetch documenation' }));
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
		setSelectedClientId(rowId)
	}


	const handleSearchBar = (searchText, searchLabel) => {
		console.log(searchText, searchLabel)
		// const searchText = event.target.value;
		if (searchText.length == 0) {
			setFilteredDocumentationList(documentationList);
		}
		else {
			setFilteredDocumentationList(documentationList.filter(product => {
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


	const addDocumentation = (newData) => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				{
					const newClient = {
						name: newData.name,
						user: isAuthenticated
							? user._id
							: "Guest"
					}; //

					DocumentationAPI.upsertDocumentation(newClient)
						.then(res => {
							if (res.data) {
								dispatch(showSuccessAlert({ message: 'New client added' }));

								const updatedClientList = [
									{ ...res.data, id: res.data._id },
									...documentationList
								];
								setDocumentationList(updatedClientList);
								const updatedFilteredList = [
									{ ...res.data, id: res.data._id },
									...filteredDocumentationList
								];
								setFilteredDocumentationList(updatedFilteredList)

							}
						})
						.catch(err => {
							dispatch(showErrorAlert({ message: 'Unable to add client' }));
						});

				}
				resolve();
			}, 10);
		})
	}

	const updateDocumentation = (newData, oldData) => {
		return new Promise((resolve, reject) => {

			const data = {
				name: newData.name,
				user: user._id
			}

			API.updateDocumentationApi(newData.id, data)
				.then(res => {
					if (res.data) {
						dispatch(showSuccessAlert({ message: 'Client updated successfully' }));

						const updatedClientList = documentationList.map(client => {
							if (client.id === newData.id) {
								return { ...res.data, id: res.data._id }
							}
							else {
								return client
							}
						});

						setDocumentationList(updatedClientList);

						const updatedFilteredList = filteredDocumentationList.map(client => {
							if (client.id === newData.id) {
								return { ...res.data, id: res.data._id }
							}
							else {
								return client
							}
						})
						setFilteredDocumentationList(updatedFilteredList)

					}

				})
				.catch(err => {
					dispatch(showErrorAlert({ message: 'Unable to update client' }));
				});

			resolve();
		})
	}

	const deleteDocumentation = (oldData) => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				{
					API.deleteDocumentationApi(oldData.id)
						.then(res => {
							const updatedClientList = documentationList.filter(client => client.id != oldData.id);
							setDocumentationList(updatedClientList)

							const updatedFilteredClientList = filteredDocumentationList.filter(client => client.id != oldData.id);
							setFilteredDocumentationList(updatedFilteredClientList)

							dispatch(showSuccessAlert({ message: 'Client removed successfully' }));
						})
						.catch(err => {
							dispatch(showErrorAlert({ message: 'Unable to delete client' }));
						});
				}
				resolve();
			}, 1000);
		})
	}

	const handleTableRowClick = (event) => history.push(`/clients/${event.id}`)

	const handleToggleModal = () => {
		setIsModalOpened(!isModalOpened)
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
			title={'Documentation'}
			selectedId={selectedClientId}
			handleHistoryToggle={handleHistoryToggle}
		>
			<AddEditDocumentationModal
				open={isModalOpened}
				toggleModal={handleToggleModal}
			/>
			<Toolbar
				title={'Documentation'}
				isGridViewSelected={isGridViewSelected}
				setIsGridViewSelected={setIsGridViewSelected}
				handleSearchBar={handleSearchBar}
				isDeletedItemVisible={isDeletedItemVisible}
				handleShowDelete={handleShowDelete}
				isHistoryModalOpened={isHistoryModalOpened}
				handleHistoryToggle={handleHistoryToggle}
				list={documentationList}
				filteredList={filteredDocumentationList}
				setFilteredList={setFilteredDocumentationList}
				columnsFields={documentationColumnsFields}
				isCustomAddButtonVisible={true}
				handleAddButtonPress={handleToggleModal}
			/>

			{
				isGridViewSelected ?
					<GridView
						list={filteredDocumentationList}
						handleHistoryToggle={handleHistoryToggle}
						columnsFields={documentationColumnsFields}
						handleTableRowClick={handleTableRowClick}
					/> :
					<TableView
						list={filteredDocumentationList}
						handleAdd={addDocumentation}
						handleUpdate={updateDocumentation}
						handleDelete={deleteDocumentation}
						columns={columns}
						handleTableRowClick={handleTableRowClick}
						isActionHidden={true}
					/>

			}
		</DefaultContainer >
	);
}

export default Documentation;
