import React from 'react';
import ItemApi from '@monostruct/common/api/items.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { fieldsForOmniDesign } from '@monostruct/common/constants/item';
import { useHistory } from 'react-router-dom';
import { Box } from '@mui/system';

export default function DesignPage() {
  const history = useHistory();
  const handleItemClick = (id, data, openInTab) => {
    let link = `/cad?id=${id}`;
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
        isAddEditActionsEnabled={false}
        isEditLinkVisible={false}
        isDesignModalOpened={false}
        isPaginationEnabled={true}
        {...{ handleItemClick }}
      />
    </Box>
  );
}
