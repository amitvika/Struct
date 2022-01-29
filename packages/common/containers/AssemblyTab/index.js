import React from 'react';

import ItemApi from '@monostruct/common/api/items.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { columnsForItemView } from '@monostruct/common/constants/item';
import { useParams, useHistory } from 'react-router-dom';

const ItemsView = () => {
  const { id } = useParams();
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

  return (
    <TableGridView
      title={'Child Items'}
      fields={columnsForItemView}
      fetchList={(query) => ItemApi.getItemsAPI(`parent_id=${id}&${query}`)}
      isAddEditActionsEnabled={false}
      handleItemClick={handleItemClick}
      isEditLinkVisible={false}
      isDesignModalOpened={false}
      isPaginationEnabled={true}
      isChildItemTable={true}
    />
  );
};

export default ItemsView;
