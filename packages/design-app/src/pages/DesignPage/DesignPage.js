import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import ProductDesignAPI from '@monostruct/common/api/productDesign.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { fields } from '@monostruct/common/constants/productDesign';
import AddUpdateModal from './AddUpdateModal';

const DesignPage = () => {
  let history = useHistory();
  const handleItemClick = (id, { type, name }) =>
    history.push(`/design?type=${type}&id=${id}&name=${name}`);

  return (
    <TableGridView
      title={'All Designs'}
      fields={fields}
      fetchList={ProductDesignAPI.fetchProductDesigns}
      upsertListItem={ProductDesignAPI.upsertProductDesign}
      isAddEditActionsEnabled={false}
      handleItemClick={handleItemClick}
      AddUpdateModal={AddUpdateModal}
      isDesignModalOpened={true}
      isEditLinkVisible={false}
      isHistoryLinkVisible={false}
      showDeleteActionButton={false}
      showHistoryButtonToolbar={false}
      showArchiveButtonToolbar={false}
    />
  );
};

export default DesignPage;
