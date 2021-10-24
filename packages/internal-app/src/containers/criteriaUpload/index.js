import React from 'react';

import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { fields } from '@monostruct/common/constants/productDesign';
import AddUpdateModal from './AddUpdateModal';

const CriteriaUpload = () => {
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
};

export default CriteriaUpload;
