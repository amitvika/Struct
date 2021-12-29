import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import ProductDesignAPI from '@monostruct/common/api/productDesign.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { fieldsForOmniDesign } from '@monostruct/common/constants/productDesign';
import AddUpdateModal from './AddUpdateModal';
import { Box } from '@mui/system';
import AddDesignMenu from './AddDesignMenu';

const DesignPage = () => {
  let history = useHistory();

  const handleItemClick = (id, data, openInTab) => {
    let link = `/${data.type}?id=${id}`;
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
        title={'All Designs'}
        fields={fieldsForOmniDesign}
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
        isCustomAddButtonVisible={false}
        CustomAddButton={AddDesignMenu}
      />
    </Box>
  );
};

export default DesignPage;
