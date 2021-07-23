import React, { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';

import CriteriaUploadAPI from '@ravibasil/common/api/criteriaUpload.api';
import TableGridView from '@ravibasil/common/components/TableGridView';
import { fields } from '@ravibasil/common/constants/productDesign'
import AddUpdateModal from "./AddUpdateModal";

const CriteriaUpload = () => {
    let history = useHistory();
    // const handleItemClick = (id, { type, name }) => history.push(`/design?type=${type}&id=${id}&name=${name}`);

    return (
        <TableGridView
            title={'Criteria Upload'}
            fields={fields}
            fetchList={CriteriaUploadAPI.fetchCriteriaUpload}
            upsertListItem={CriteriaUploadAPI.upsertCriteriaUpload}
            isAddEditActionsEnabled={true}
            // handleItemClick={handleItemClick}
            isAddEditLinkVisible={true}
            AddUpdateModal={AddUpdateModal}
            isDesignModalOpened={true}
        />
    );
}

export default CriteriaUpload;