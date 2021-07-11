import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {
    Select,
    Input,
    Textarea,
    Headding
} from '../../components';

import Modal from '../../components/Modal';
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

        setValue(preValue => ({
            ...preValue,
            [name]: data,
            file_history_list: name === "file_load" ? [data, ...preValue.file_history_list] : preValue.file_history_list
        }));
    }

    const handleSaveButton = () => {
        if (value) {
            handleUpdate(value)
        }
        toggleModal();
    }

    const handleTypeChange = (data) => {
        setIsTypeSelected(true);
        setSelectedType(data);
        handleOnChange('category', data)
    }

    const renderField = (item) => {
        if (item.type === 'text') {
            return (
                <Input
                    placeholder="Enter"
                    type="text"
                    onChange={(event) => handleOnChange(item.field, event.target.value)}
                    value={value[item.field]}
                />)
        }
        else if (item.type === 'select') {
            return (
                <Select
                    options={[
                        { label: "Criteria", value: "criteria" },
                        { label: 'Hierarchy', value: 'hierarchy' },]}
                    onChange={(data) => handleTypeChange(data.value)}
                    value={value.category && { label: value.category }}
                />
            )
        }
    }

    const renderView = () => {
        return fields
            .filter(item => item.type)
            .map(item => {
                return (<>
                    <Grid item xs={4}>
                        <Headding bold title={item.title} />
                    </Grid>
                    <Grid item xs={8}>
                        {renderField(item)}
                    </Grid>
                </>)

            })
    }

    return (
        <Modal
            title={`${isEditing ? `Update ${selectedValue.name}` : 'Add'} ${title}`}
            open={open}
            toggleModal={toggleModal}>

            <Grid className="section-padding-left" container spacing={4}>
                {renderView()}
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
                        onChange={(event) => handleOnChange('note', event.target.value)}
                        value={value.note}
                    />
                </Grid>

                <FileUpload value={value} handleOnChange={handleOnChange} />
                <FileHistory file_history_list={value.file_history_list} />

                <Grid item xs={6}>
                    <Button variant="contained" color="primary" onClick={handleSaveButton}>
                        {isEditing ? 'Update' : 'Save'}
                    </Button>
                </Grid>
            </Grid>

        </Modal>
    );
}
