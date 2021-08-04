import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import {
    Select,
    Input,
    Textarea,
    Headding
} from '@ravibasil/common/components';
import Modal from '@ravibasil/common/components/Modal'
import { uploadFileS3Bucket } from '@ravibasil/common/api/aws';
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import FileHistory from '@ravibasil/common/containers/FileHistory'
import FileUpload from '@ravibasil/common/containers/FileUploadOnAWS'

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
        padding: theme.spacing(1),
    },
    popover: {
        pointerEvents: 'none',
    },
}));

export default function AddDocumentationModal({ open, toggleModal, handleUpdate, isEditing, selectedValue }) {
    const classes = useStyles();
    // const [docs, setdocs] = useState([]);
    const [isDesignModalOpened, setIsDesignModalOpened] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [documentValue, setdocumentValue] = useState({});

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const isPopoverOpen = Boolean(anchorEl);

    useEffect(() => {
        if (selectedValue) {
            setdocumentValue(selectedValue)
        }
        else {
            setdocumentValue({});
        }
        console.log(selectedValue)
    }, [selectedValue])

    const handleOnChange = (name, data) => {

        let file_history = documentValue.file_history || [];
        if (name === "new_file") {
            file_history = [data, ...file_history];
            setSelectedFileName(data.file_url)
        }

        setdocumentValue(preValue => ({
            ...preValue,
            [name]: data,
            file_url: data.file_url ? data.file_url : preValue.file_url,
            file_history
        }));
    }

    const handleSaveButton = () => {
        if (documentValue) {
            handleUpdate(documentValue)
        }
        toggleModal();
    }

    const handleArchive = () => {
        setdocumentValue(preValue => ({
            ...preValue,
            is_archived: preValue.is_archived ? false : true
        }))

    }

    return (
        <Modal
            open={open}
            toggleModal={toggleModal}
            title={`${isEditing ? 'Update ' : 'Add'} Documentation`}
        >
            <Grid className="section-padding-left" container spacing={4}>
                <Grid item xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        aria-owns={isPopoverOpen ? 'mouse-over-popover' : undefined}
                        aria-haspopup="true"
                        onMouseEnter={handlePopoverOpen}
                        onMouseLeave={handlePopoverClose}
                        onClick={handleArchive}>
                        {`${documentValue.is_archived ? 'Unarchive' : 'Archive'}`}
                    </Button>
                    <Popover
                        id="mouse-over-popover"
                        className={classes.popover}
                        classes={{
                            paper: classes.paper,
                        }}
                        open={isPopoverOpen}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        onClose={handlePopoverClose}
                        disableRestoreFocus
                    >
                        <Typography>Archive is the same thing as deleting except you can "un-delete" an item if you need it again</Typography>
                    </Popover>

                </Grid>
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

                <FileUpload
                    value={documentValue}
                    handleOnChange={handleOnChange} isDesignModalOpened={isDesignModalOpened}
                    fileType={"/"} />
                <FileHistory
                    selectedFileName={selectedFileName}
                    link_id={documentValue.id} />


                <Grid item xs={12} className={classes.action_button}>
                    <Button variant="contained" color="primary" onClick={handleSaveButton} style={{ width: '100%' }}>
                        {isEditing ? 'Update' : 'Save'}
                    </Button>
                </Grid>
            </Grid>

        </Modal >
    );
}
