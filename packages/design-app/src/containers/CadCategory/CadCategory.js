import React from 'react';
import ItemApi from '@monostruct/common/api/items.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { columnsForItemView } from '@monostruct/common/constants/item';
import { useHistory } from 'react-router-dom';

export default function CadCategory() {
  const history = useHistory();

  const handleItemClick = (id, data, openInTab) => {
    let link = `/cad/${id}`;
    if (openInTab) {
      const win = window.open(link, '_blank');
      win.focus();
    } else {
      history.push(link);
    }
  };

  return (
    <TableGridView
      title={'Items'}
      fields={columnsForItemView}
      fetchList={(qS) => ItemApi.getItemsAPI(`not_for_public_use=false&${qS}`)}
      isAddEditActionsEnabled={false}
      isEditLinkVisible={false}
      isDesignModalOpened={false}
      isPaginationEnabled={true}
      {...{ handleItemClick }}
    />
  );
}
