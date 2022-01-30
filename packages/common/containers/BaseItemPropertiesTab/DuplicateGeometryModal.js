import React from 'react';
import MainModal from '@monostruct/common/components/Modal';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ItemApi from '@monostruct/common/api/items.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { columnsForItemView } from '@monostruct/common/constants/item';
import { useParams, useHistory } from 'react-router-dom';

export default function DuplicateGeometryModal() {
  const [isOpen, setOpen] = React.useState(false);
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
          <CreateDuplicateChildItems />
          <IdentifiedDuplicateItems />
        </Box>
      </MainModal>
    </>
  );
}

const CreateDuplicateChildItems = () => {
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
      >
        Create item with duplicate geometry
      </Button>
    </Box>
  );
};

const IdentifiedDuplicateItems = () => {
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
      title={'Identified duplicate items'}
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
