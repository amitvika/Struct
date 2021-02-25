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
import { NavLink, useParams } from "react-router-dom";
import get from 'lodash/get';

const Documentation = () => {
	let history = useHistory();
	const dispatch = useDispatch();
	let { id: client_id } = useParams();

	const [isLoading, setIsLoading] = useState(false);
	const [documentationList, setDocumentationList] = useState([]);
	const [filteredDocumentationList, setFilteredDocumentationList] = useState([]);
	const [isHistoryModalOpened, setIsHistoryModalOpened] = useState(false);
	const [isDeletedItemVisible, setIsDeletedItemVisible] = useState(false);
	const [isGridViewSelected, setIsGridViewSelected] = useState(true);
	const [isModalOpened, setIsModalOpened] = useState(false);
	const [selectedDocument, setSelectedDocument] = useState(null);
	const [isEditingDocument, setIsEditingDocument] = useState(false);

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
	]);

	useEffect(() => {
		fetchDocumentations();
	}, []);

	const fetchDocumentations = async () => {
		try {
			if (!client_id) {
				return
			}
			setIsLoading(true);

			const res = await DocumentationAPI.fetchDocumentations(`client_id=${client_id}`)
			const documentations = mapDocumentations(get(res, 'data', []));

			setDocumentationList(documentations)
			setFilteredDocumentationList(documentations)

			setIsLoading(false);

		} catch (error) {
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
		// setSelectedDocument(rowId)
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


	const handleDocumentationUpdate = (value) => {
		let data = {
			...value,
			client_id
		}
		DocumentationAPI.upsertDocumentation(data)
			.then(res => {
				if (res.data) {
					dispatch(showSuccessAlert({ message: 'Documentation updated' }));

					const availableDoc = documentationList.find(document => document.id == res.data._id);

					if (availableDoc) {
						setDocumentationList(documentationList.map(document => {
							if (document.id === res.data._id) {
								return { ...res.data, id: res.data._id }
							}
							return document
						}));

						setFilteredDocumentationList(filteredDocumentationList.map(document => {
							if (document.id === res.data._id) {
								return { ...res.data, id: res.data._id }
							}
							return document
						}))
					}
					else {
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

				}

				setIsEditingDocument(false)
			})
			.catch(err => {
				dispatch(showErrorAlert({ message: 'Unable to add documentation' }));
			});
	}

	const handleTableRowClick = (data) => {
		setIsEditingDocument(true);
		setSelectedDocument(data);
		handleToggleModal();
	}

	const handleToggleModal = () => {
		if(isModalOpened){
			setSelectedDocument(null);
			setIsEditingDocument(false);
		}
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
			selectedId={selectedDocument}
			handleHistoryToggle={handleHistoryToggle}
		>
			<AddEditDocumentationModal
				open={isModalOpened}
				toggleModal={handleToggleModal}
				handleDocumentationUpdate={handleDocumentationUpdate}
				isEditingDocument={isEditingDocument}
				selectedDocument={selectedDocument}
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
						columns={columns}
						handleTableRowClick={handleTableRowClick}
						isActionHidden={true}
					/>

			}
		</DefaultContainer >
	);
}

export default Documentation;
