import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {
    Select,
    Input,
    Textarea,
    Headding
} from '../../components';
import MainModal from '../../components/Modal';


export default function AddEditModal({
    isAddEditFactoryModalOpened,
    toggleAddEditFactoryModal
}) {

    return (
        <MainModal open={isAddEditFactoryModalOpened} toggleModal={toggleAddEditFactoryModal}   >
            <Grid className="section-padding-left" container spacing={4}>
              hello
            </Grid>
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
                        Save
                    </Button>
                </Grid>
            </Grid>
        </MainModal>
    )
}
