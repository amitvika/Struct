import React from 'react'
import MainModal from '../../components/Modal';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {
    Select,
    Input,
    Textarea,
    Headding
} from '../../components';

export default function AddEditClientModal({
    title,
    isEditing,
    isAddEditClientModalOpened,
    toggleAddEditClientModal
}) {
    return (
        <MainModal open={isAddEditClientModalOpened}
            toggleModal={toggleAddEditClientModal}>
            // title={`${isEditing ? 'Update' : 'Add'} ${title}`}

            <Grid className="section-padding-left" container spacing={4}>
                {/* {renderView()} */}

                <Grid item xs={6}>
                    <Button variant="contained" color="secondary" >
                        Cancel
                        </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color="primary" >
                        
                        {/* {isEditing ? 'Update' : 'Save'} */}
                    </Button>
                </Grid>
            </Grid>
        </MainModal>
    )
}
