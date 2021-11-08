import React, { useEffect, useState } from 'react';

import ItemApi from '@monostruct/common/api/items.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { columnsForItemView } from '@monostruct/common/constants/item';
import { useHistory } from 'react-router-dom';
import AdditionalFilter from './AdditionalFilter';

const ItemsView = () => {
  let history = useHistory();
  const handleItemClick = (id) => history.push(`/items/${id}`);
  const handleAddButtonPress = () => history.push({ pathname: `/items/124`, state: { status: 'new_item' } });

  return (
    <TableGridView
      title={'Items'}
      fields={columnsForItemView}
      fetchList={ItemApi.getItemsAPI}
      isAddEditActionsEnabled={true}
      handleItemClick={handleItemClick}
      isAddEditLinkVisible={true}
      upsertListItem={(data) => ItemApi.updateItemAPI(null, data)}
      isDesignModalOpened={true}
      AdditionalFilter={AdditionalFilter}
      handleAddButtonPress={handleAddButtonPress}
    />
  );
};

export default ItemsView;
