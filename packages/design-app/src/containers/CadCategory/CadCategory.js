import React from 'react';
import ItemApi from '@monostruct/common/api/items.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { columnsForItemView } from '@monostruct/common/constants/item';

export default function CadCategory() {
  return (
    <TableGridView
      title={'Items'}
      fields={columnsForItemView}
      fetchList={(qS) => ItemApi.getItemsAPI(`not_for_public_use=true&${qS}`)}
      isAddEditActionsEnabled={false}
      isEditLinkVisible={false}
      isDesignModalOpened={false}
      isPaginationEnabled={true}
    />
  );
}
