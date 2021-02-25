import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
// import FileViewer from 'react-file-viewer';
import PDFViewer from 'pdf-viewer-reactjs'
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import {
    Select,
    Input,
    Textarea,
    Headding
} from '../../components';
import { uploadFileS3Bucket } from '../../api/aws';

const useStyles = makeStyles((theme) => ({
    modal: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        overflow: 'scroll',
        height: '100%',
        display: 'block'
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        marginLeft: '20%',
        marginRight: '20%'
    },
}));

export default function AddDocumentationModal({ open, toggleModal, handleDocumentationUpdate, isEditingDocument, selectedDocument }) {
    const classes = useStyles();
    const [file, setFile] = useState('---');
    const [type, setType] = useState('pdf');

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

    const onChange = async e => {
        if (!e.target.files[0]) {
            return;
        }

        await uploadFileS3Bucket(e.target.files[0])
    };

    const handleSaveButton = () => {
        if (documentValue) {
            handleDocumentationUpdate(documentValue)
        }
        toggleModal();
    }

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={open}
            onClose={toggleModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={open}>
                <div className={classes.paper}>
                    <h2 id="simple-modal-title">Add Documentation</h2>
                    <p id="simple-modal-description">
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
      </p>
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

                        <Grid item xs={4}>
                            <Headding bold title={'Category'} />
                        </Grid>
                        <Grid item xs={8}>
                            <Select
                                placeholder="Select"
                                options={[
                                    { label: "Requirements", value: "Requirements" },
                                    { label: 'Service Agreement', value: 'Service Agreement' },
                                    { label: 'Communications', value: 'Communications' }
                                ]}
                                onChange={(data) => handleOnChange('category', data.value)}
                                value={documentValue.category && { label: documentValue.category }}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <Headding bold title={'Note'} />
                        </Grid>
                        <Grid item xs={8}>
                            <Textarea
                                placeholder="Enter"
                                onChange={(event) => handleOnChange('note', event.target.value)}
                                value={documentValue.note}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <Headding bold title={'Upload File'} />
                        </Grid>
                        <Grid item xs={8}>
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
                        </Grid>
                        {file &&

                            <Grid item xs={12}>
                                {/* <FileViewer
                                fileType={type}
                                filePath={file}
                                errorComponent={<></>}
                                onError={(err) => {
                                    console.log(err)
                                }} /> */}
                                {/* <div style={{ height: '300px', overflow: 'scroll' }}> */}
                                {/* <PDFViewer
                                    document={{
                                        url: 'https://arxiv.org/pdf/quant-ph/0410100.pdf',
                                    }}
                                    showThumbnail={{ scale: 2 }}
                                /> */}
                                {/* </div> */}
                            </Grid>
                        }

                        <Grid item xs={6} className={classes.action_button}>
                            <Button variant="contained" color="secondary" onClick={toggleModal}>
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item xs={6} className={classes.action_button}>
                            <Button variant="contained" color="primary" onClick={handleSaveButton}>
                                {isEditingDocument ? 'Update' : 'Save'}
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </Fade>
        </Modal>
    );
}
