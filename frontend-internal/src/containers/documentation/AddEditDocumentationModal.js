import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
// import FileViewer from 'react-file-viewer';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import {
    Select,
    Input,
    Textarea,
    Headding
} from '../../components';
import { uploadFileS3Bucket } from '../../api/aws';
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

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
    // const [docs, setdocs] = useState([]);
    const [selectedFileName, setSelectedFileName] = useState('');
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

    const onChange = async event => {
        if (!event.target.files[0]) {
            return;
        }
        setSelectedFileName(event.target.files[0].name)
        const file_url = await uploadFileS3Bucket(event.target.files[0])
        // setdocs([{ uri: fileUrl }]);
        handleOnChange('file_url', file_url)
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
            }}>
            <Fade in={open}>
                <div className={classes.paper}>
                    <h2 id="simple-modal-title">{isEditingDocument ? 'Update ' : 'Add'} Documentation</h2>
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
                            documentValue.file_url &&
                            <Grid item xs={12}>
                                <DocViewer
                                    pluginRenderers={DocViewerRenderers}
                                    documents={[{ uri: documentValue.file_url }]} />
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
