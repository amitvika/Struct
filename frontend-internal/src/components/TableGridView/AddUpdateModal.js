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

export default function AddUpdateModal({ title, fields, open, toggleModal, handleUpdate, isEditing, selectedValue }) {
    const [value, setValue] = useState({});

    useEffect(() => {
        if (selectedValue) {
            setValue(selectedValue)
        }
        else {
            setValue({});
        }
    }, [selectedValue])

    const handleOnChange = (name, value) => {
        setValue(preValue => ({
            ...preValue,
            [name]: value
        }))
    }

    const handleSaveButton = () => {
        if (value) {
            handleUpdate(value)
        }
        toggleModal();
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
        // else if (item.type === 'select') {
        //     return (
        //         <Select
        //             onChange={(data) => handleOnChange(data, item.field)}
        //             options={[]}
        //             placeholder={`Select ${item.title}`}
        //             value={value[item.field]} />
        //     )
        // }
    }

    return (
        <Modal
            title={`${isEditing ? 'Update' : 'Add'} ${title}`}
            open={open}
            toggleModal={toggleModal}>

            <Grid className="section-padding-left" container spacing={4}>
                {renderView()}

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
