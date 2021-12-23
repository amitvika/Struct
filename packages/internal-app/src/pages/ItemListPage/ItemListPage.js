import React from 'react';

import ItemApi from '@monostruct/common/api/items.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { columnsForItemView } from '@monostruct/common/constants/item';
import { useHistory } from 'react-router-dom';
import AdditionalFilter from './AdditionalFilter';
import { NEW_ITEM, saveToSessionStorage } from '../../utils/usefulHelpers';
import ObjectID from 'bson-objectid';

const ItemsView = () => {
  let history = useHistory();
  const handleItemClick = (id, data, openInTab) => {
    let link = `/items/${id}`;
    if (openInTab) {
      const win = window.open(link, '_blank');
      win.focus();
    } else {
      history.push(link);
    }
  };
  const handleAddButtonPress = () => {
    const newItemId = ObjectID().toString();

    const item = {
      id: newItemId,
      name: 'Untitled-1'
    };
    saveToSessionStorage(NEW_ITEM, item);
    handleItemClick(newItemId);
  };

  return (
    <TableGridView
      title={'Items'}
      fields={columnsForItemView}
      fetchList={ItemApi.getItemsAPI}
      isAddEditActionsEnabled={true}
      handleItemClick={handleItemClick}
      isEditLinkVisible={false}
      upsertListItem={(data) => ItemApi.updateItemAPI(null, data)}
      isDesignModalOpened={true}
      AdditionalFilter={AdditionalFilter}
      handleAddButtonPress={handleAddButtonPress}
      isPaginationEnabled={true}
    />
  );
};

export default ItemsView;
