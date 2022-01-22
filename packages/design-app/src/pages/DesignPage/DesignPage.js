import React from 'react';
import ItemApi from '@monostruct/common/api/items.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { fieldsForOmniDesign } from '@monostruct/common/constants/item';
import { useHistory } from 'react-router-dom';
import { Box } from '@mui/system';
import AddDesignMenu from './AddDesignMenu';

export default function DesignPage() {
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
    <Box sx={{ margin: '20px 7%' }}>
      <TableGridView
        title={'Items'}
        fields={fieldsForOmniDesign}
        fetchList={(qS) =>
          ItemApi.getItemsAPI(`not_for_public_use=false&${qS}`)
        }
        {...{
          isPaginationEnabled: true,
          isAddEditActionsEnabled: false,
          isDesignModalOpened: true,
          isEditLinkVisible: false,
          isHistoryLinkVisible: false,
          showDeleteActionButton: false,
          showHistoryButtonToolbar: false,
          showArchiveButtonToolbar: false,
          handleItemClick,
          isCustomAddButtonVisible: false,
          CustomAddButton: AddDesignMenu
        }}
      />
    </Box>
  );
}
