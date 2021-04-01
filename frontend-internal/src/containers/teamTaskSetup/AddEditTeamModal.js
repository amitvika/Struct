import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import {
    Select,
    Input,
    Textarea,
    Headding
} from '../../components';
import Modal from '../../components/Modal'

export default function AddEditTeamModal({ open, toggleModal, handleUpdate, isEditing, selectedDocument }) {
    const [documentValue, setdocumentValue] = useState({});

    useEffect(() => {
        if (selectedDocument) {
            setdocumentValue(selectedDocument)
        }
        else {
            setdocumentValue({});
        }
    }, [selectedDocument])

    const handleOnChange = (name, value) => {
        setdocumentValue(preValue => ({
            ...preValue,
            [name]: value
        }))
    }

    const handleSaveButton = () => {
        if (documentValue) {
            handleUpdate(documentValue)
        }
        toggleModal();
    }

    return (
        <Modal
            title={isEditing ? 'Update Team' : 'Add Team'}
            open={open}
            toggleModal={toggleModal}>

            <Grid className="section-padding-left" container spacing={4}>

                <Grid item xs={4}>
                    <Headding bold title={'Name'} />
                </Grid>
                <Grid item xs={8}>
                    <Input
                        placeholder="Enter"
                        type="text"
                        onChange={(event) => handleOnChange('name', event.target.value)}
                        value={documentValue.name}
                    />
                </Grid>

                <Grid item xs={6}>
                    <Button variant="contained" color="secondary" onClick={toggleModal}>
                        Cancel
                            </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color="primary" onClick={handleSaveButton}>
                        {isEditing ? 'Update' : 'Save'}
                    </Button>
                </Grid>
            </Grid>

        </Modal>
    );
}
