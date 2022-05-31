import React from 'react';
import MainModal from '@monostruct/common/components/Modal';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DuplicateItemsApi from '@monostruct/common/api/duplicateItems.api';
import ItemAPI from '@monostruct/common/api/items.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { columnsForItemView } from '@monostruct/common/constants/item';
import { useParams, useHistory } from 'react-router-dom';

export default function DuplicateGeometryModal() {
  const [isOpen, setOpen] = React.useState(false);
  const [itemList, setItemList] = React.useState(null);
  const handleDuplicateItems = (itemList) => {
    setItemList(itemList);
  };

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Duplicate Item Flow
      </Button>
      <MainModal
        {...{
          open: isOpen,
          toggleModal: () => setOpen(false),
          boxConstainerStyle: {
            width: '70%'
          }
        }}
      >
        <Box>
          <CreateDuplicateChildItems itemList={itemList} />
          <IdentifiedDuplicateItems handleDuplicateItems={handleDuplicateItems} />
        </Box>
      </MainModal>
    </>
  );
}

const CreateDuplicateChildItems = ({ itemList }) => {
  const { id } = useParams();
  const createDuplicateItems = () => {
    const newItem = itemList.map((item) => ({
      fileUUId: item.fileUUId,
      name: item.fileName,
      fileName: item.fileName,
      fileStore: item.fileStore,
      parent_id: id,
      compliance: item.compliance,
      fullProcess: item.fullProcess,
      storage: item.storage,
      distanceGap: item.distanceGap,
      angleGap: item.angleGap,
      drawLine: item.drawLine,
      hierarchySelections: item.hierarchySelections,
      classificationConfig: item.classificationConfig,
      is_child_item: true,
      multiAssembly: item.multiAssembly ? item.multiAssembly : false
    }));
    try {
      return ItemAPI.upsertItems(newItem);
    } catch (error) {
      console.log('While creating error', newItem, error);
      return false;
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Typography variant="h5" gutterBottom component="div">
        Item(s) with the same geometry are found in the database, displayed
        below. Would you like to create a new instance of this geometry or
        select an item below to create a new reference within?
      </Typography>
      <Button
        variant="contained"
        sx={{
          width: '100%',
          whiteSpace: 'nowrap',
          height: 'fit-content'
        }}
        onClick={createDuplicateItems}
      >
        Create item with duplicate geometry
      </Button>
    </Box>
  );
};

const IdentifiedDuplicateItems = ({ handleDuplicateItems }) => {
  const { id } = useParams();
  let history = useHistory();
  const handleItemClick = (newId, data, openInTab) => {
    let link = `/items/${newId}`;
    if (newId !== id) {
      const win = window.open(link, '_blank');
      win.focus();
    } else {
      history.push(link);
    }
  };

  const handleFilteredList = (filteredList) => {
    handleDuplicateItems(filteredList);
  };

  return (
    <TableGridView
      title={'Identified duplicate items'}
      fields={columnsForItemView}
      fetchList={(query) => DuplicateItemsApi.getItemsAPI(`id=${id}&${query}`)}
      isAddEditActionsEnabled={false}
      handleItemClick={handleItemClick}
      handleFilteredList={handleFilteredList}
      isEditLinkVisible={false}
      isDesignModalOpened={false}
      isPaginationEnabled={false}
      isChildItemTable={true}
      isToolbarEnabled={false}
      isHistoryLinkVisible={false}
      showDeleteActionButton={false}
    />
  );
};
