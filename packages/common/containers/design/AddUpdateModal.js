import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {
    Select,
    Input,
    Textarea,
    Headding
} from '../../components';
// import TableView from './TableView';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Icon,
    CircularProgress
} from "@material-ui/core";
import { uploadFileS3Bucket } from '@ravibasil/common/api/aws';
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import Modal from '../../components/Modal'
import {typeOption,tableFields} from '@ravibasil/common/constants/productDesign'


export default function AddUpdateModal({ title, fields, open, toggleModal, handleUpdate, isEditing, selectedValue }) {
    const [value, setValue] = useState({});
    const [selectedFileName, setSelectedFileName] = useState('');
    const [isTypeSelected, setIsTypeSelected] = useState(false)
    const [selectedType, setSelectedType] = useState('')


    useEffect(() => {
        if (selectedValue) {
            setValue(selectedValue)
        }
        else {
            setValue({});
        }
    }, [selectedValue])

    const handleOnChange = (name, value) => {
        setIsTypeSelected(true)
        console.log('---',value)
        setSelectedType(value)
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

    const onChange = async event => {
        if (!event.target.files[0]) {
            return;
        }
        setSelectedFileName(event.target.files[0].name)
        const file_url = await uploadFileS3Bucket(event.target.files[0])
        // setdocs([{ uri: fileUrl }]);
        handleOnChange('file_url', file_url)
    };


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
        else if (item.type === 'select') {
            return (
                <Select
                    options={[
                        { label: "Criteria", value: "criteria" },
                        { label: 'Hierarchy', value: 'hierarchy' },]}
                    onChange={(data) => handleOnChange('category', data.value)}
                    value={value.category && { label: value.category }}
                />
            )
        }
    }

    return (
        <Modal
            title={`${isEditing ? `Update ${selectedValue.name}` : 'Add'} ${title}`}
            open={open}
            toggleModal={toggleModal}>

            <Grid className="section-padding-left" container spacing={4}>
                {renderView()}
                <Grid item xs={4}>
                   
                </Grid>
                <Grid item xs={8}>
                    {
                        isTypeSelected &&
                        <Button variant="contained" color="secondary">
                        {selectedType === 'criteria'? 'Download Criteria Upload Template' : 'Download Hirarchy Upload Template'}   
                        </Button>
                    }
                </Grid>
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
                <Grid item xs={4}>
                    <Headding bold title={'File Load'} />
                </Grid>
                <Grid item xs={8} style={{ display: 'flex' }}>
                    <div>
                        <Button
                            variant="contained"
                            component="label">
                            Select File
                            <input
                                onChange={onChange}
                                type="file"
                                hidden
                            />
                        </Button>
                    </div>
                </Grid>
                {
                    value.file_url &&
                    <Grid item xs={12}>
                        <DocViewer
                            pluginRenderers={DocViewerRenderers}
                            documents={[{ uri: value.file_url }]} />
                    </Grid>
                }

                <h5>File History</h5>
                <TableContainer component={Paper}>
                    Spreadsheets Only
                    <Table aria-label="simple table">

                        <TableHead>
                            <TableRow>
                                <TableCell>Loaded At</TableCell>
                                <TableCell>Cleared At</TableCell>
                                <TableCell>Loaded By</TableCell>
                                <TableCell>Cleared By</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* {materialList.map(materialRow => ( */}
                            <TableRow
                            // key={materialRow._id}
                            >
                                <TableCell>
                                    {/* {materialRow._id} */}
                                </TableCell>

                            </TableRow>
                            {/* ))} */}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* <Grid item xs={6}>
                    <Button variant="contained" color="secondary" onClick={toggleModal}>
                        Cancel
                    </Button>
                </Grid> */}
                <Grid item xs={6}>
                    <Button variant="contained" color="primary" onClick={handleSaveButton}>
                        {isEditing ? 'Update' : 'Save'}
                    </Button>
                </Grid>
            </Grid>

        </Modal>
    );
}
