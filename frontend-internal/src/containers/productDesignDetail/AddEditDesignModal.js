import React,{useEffect, useState} from 'react'
import MainModal from '../../components/Modal';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {
    Select,
    Input,
    Textarea,
    Headding
} from '../../components';

export default function AddEditDesignModal({ isAddEditDesignModalOpened, toggleAddEditDesignModal, title, fields, selectedValue, isEditing, addProductDesign }) {
    const [value, setValue] = useState({});
    useEffect(() => {
        if (selectedValue) {
            setValue(selectedValue)
        }
        else {
            setValue({});
        }
    }, [selectedValue])

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

    const handleOnChange = (name, value) => {
        setValue(preValue => ({
            ...preValue,
            [name]: value
        }))
    }

    const handleSaveButton = async () => {
        if (value) {
            console.log("--------",selectedValue,value)
          await addProductDesign(value)
        }
        toggleAddEditDesignModal();
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
    }
    return (
        <MainModal
            open={isAddEditDesignModalOpened}
            toggleModal={toggleAddEditDesignModal}
            title={`${isEditing ? 'Update' : 'Add'} ${title}`}>

            <Grid className="section-padding-left" container spacing={4}>
                {renderView()}

                <Grid item xs={6}>
                    <Button variant="contained" color="secondary" onClick={toggleAddEditDesignModal} >
                        Cancel
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color="primary" onClick={handleSaveButton} >
                        {isEditing ? 'Update' : 'Save'}
                    </Button>
                </Grid>
            </Grid>
        </MainModal>
    )
}
