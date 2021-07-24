import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {
    Select,
    Input,
    Textarea,
    Headding
} from '@ravibasil/common/components';

import Modal from '@ravibasil/common/components/Modal';
import FileUpload from './FileUpload';
import FileHistory from './FileHistory';

export default function AddUpdateModal({ title, fields, open, toggleModal, handleUpdate, isEditing, selectedValue }) {
    const [value, setValue] = useState({});
    const [isTypeSelected, setIsTypeSelected] = useState(false)
    const [selectedType, setSelectedType] = useState('')

    useEffect(() => {
        if (selectedValue) {
            setValue(selectedValue)
        }
        else {
            setValue({});
        }
    }, [selectedValue]);

    const handleOnChange = (name, data) => {

        let file_history = value.file_history || [];
        if (name === "new_file") {
            file_history = [data, ...file_history]
        }

        setValue(preValue => ({
            ...preValue,
            [name]: data,
            file_history
        }));
    }

    const handleSaveButton = () => {
        if (value) {
            handleUpdate(value)
        }
        // toggleModal();
    }

    const handleTypeChange = (data) => {
        setIsTypeSelected(true);
        setSelectedType(data);
        handleOnChange('category', data)
    }

    return (
        <Modal
            title={`${isEditing ? `Update ${selectedValue.name}` : 'Add'} ${title}`}
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
                        value={value.name}
                    />
                </Grid>

                <Grid item xs={4}>
                    <Headding bold title={'Category'} />
                </Grid>
                <Grid item xs={8}>
                    <Select
                        options={[
                            { label: "Criteria", value: "criteria" },
                            { label: 'Hierarchy', value: 'hierarchy' },]}
                        onChange={(data) => handleTypeChange(data.value)}
                        value={value.category && { label: value.category }}
                    />
                </Grid>

                {
                    isTypeSelected &&
                    <>
                        <Grid item xs={4}>
                        </Grid>
                        <Grid item xs={8}>
                            <a href={`${process.env.REACT_APP_API}/download/${selectedType}`}
                                target="_blank"
                                style={{ textDecoration: 'none' }}>
                                <Button variant="contained" color="secondary">
                                    {selectedType === 'criteria' ? 'Download Criteria Upload Template' : 'Download Hirarchy Upload Template'}
                                </Button>
                            </a>
                        </Grid>
                    </>
                }
                <Grid item xs={4}>
                    <Headding bold title={'Note'} />
                </Grid>
                <Grid item xs={8}>
                    <Textarea
                        placeholder="Enter"
                        onChange={(event) => handleOnChange('notes', event.target.value)}
                        value={value.notes}
                    />
                </Grid>

                <FileUpload value={value} handleOnChange={handleOnChange} />
                <FileHistory link_id={value.id} />

                <Grid item xs={6}>
                    <Button variant="contained" color="primary" onClick={handleSaveButton}>
                        {isEditing ? 'Update' : 'Save'}
                    </Button>
                </Grid>
            </Grid>

        </Modal>
    );
}
