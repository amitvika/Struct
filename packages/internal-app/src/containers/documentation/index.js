import React from "react";
import { NavLink, useParams } from "react-router-dom";

import DocumentationAPI from '@ravibasil/common/api/documentation.api';
import { documentationFields } from '../../constants/client'

import TableGridView from '@ravibasil/common/components/TableGridView';

import AddEditDocumentationModal from './AddEditDocumentationModal';

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
