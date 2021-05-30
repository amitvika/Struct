import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from "reactstrap";

import DocumentationAPI from '../../api/documentation.api';
import { documentationFields } from '../../constants/client'
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
// import { mapDocumentations } from '../../utils/mapper';

import TableGridView from '../../components/TableGridView';

import AddEditDocumentationModal from './AddEditDocumentationModal';
import { NavLink, useParams } from "react-router-dom";
import get from 'lodash/get';

const Documentation = () => {
	let { id: client_id } = useParams();

	return (
		<TableGridView
			title={'Documentation'}
			fields={documentationFields}
			fetchList={() => DocumentationAPI.fetchDocumentations(`client_id=${client_id}`)}
			upsertListItem={(value) => DocumentationAPI.upsertDocumentation({ ...value, client_id })}
			AddUpdateModal={AddEditDocumentationModal}
		/>
	);
}

export default Documentation;
