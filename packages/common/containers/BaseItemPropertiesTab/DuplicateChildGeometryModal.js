import React from 'react';
import MainModal from '@monostruct/common/components/Modal';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import DuplicateChildItemsApi from '@monostruct/common/api/duplicateChildItem.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { columnsForItemView } from '@monostruct/common/constants/item';
import { useParams, useHistory } from 'react-router-dom';

export default function DuplicateGeometryModal() {
    const [isOpen, setOpen] = React.useState(false);
    return (
        <>
            <Button variant="outlined" onClick={() => setOpen(true)}>
                Duplicate Child Item Flow
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
        <Box sx={{ display: 'flex', alignItems: 'center' }} >
            <Typography variant="h5" gutterBottom component="div">
                Child Item(s) with the same geometry are found in the database, displayed below.
            </Typography>
        </Box>
    );
};

const IdentifiedDuplicateItems = () => {
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

    return (
        <TableGridView
            title={'Identified duplicate child items'}
            fields={columnsForItemView}
            fetchList={(query) => DuplicateChildItemsApi.getItemsAPI(`id=${id}&${query}`)}
            isAddEditActionsEnabled={false}
            handleItemClick={handleItemClick}
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
