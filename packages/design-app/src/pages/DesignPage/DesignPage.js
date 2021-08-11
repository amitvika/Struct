import React, { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';

import ProductDesignAPI from '@ravibasil/common/api/productDesign.api';
import TableGridView from '@ravibasil/common/components/TableGridView';
import { fields } from '@ravibasil/common/constants/productDesign'
import AddUpdateModal from "./AddUpdateModal";

const DesignPage = () => {
  let history = useHistory();
  const handleItemClick = (id, { type, name }) => history.push(`/design?type=${type}&id=${id}&name=${name}`);

  return (
    <TableGridView
      title={'Product Design'}
      fields={fields}
      fetchList={ProductDesignAPI.fetchProductDesigns}
      upsertListItem={ProductDesignAPI.upsertProductDesign}
      isAddEditActionsEnabled={true}
      handleItemClick={handleItemClick}
      isAddEditLinkVisible={true}
      AddUpdateModal={AddUpdateModal}
      isDesignModalOpened={true}
    />
  );
}

export default DesignPage;