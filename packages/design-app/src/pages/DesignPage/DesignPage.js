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
    <div style={{ margin: '0  7% 0 7%' }}>
      <TableGridView
        title={'Product Design'}
        fields={fields}
        fetchList={ProductDesignAPI.fetchProductDesigns}
        upsertListItem={ProductDesignAPI.upsertProductDesign}
        isAddEditActionsEnabled={false}
        handleItemClick={handleItemClick}
        AddUpdateModal={AddUpdateModal}
        isDesignModalOpened={true}
        isEditLinkVisible={false}
        isHistoryLinkVisible={false}
      />
    </div>
  );
};

export default DesignPage;
