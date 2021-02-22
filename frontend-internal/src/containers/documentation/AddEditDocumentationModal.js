import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import FileViewer from 'react-file-viewer';

function rand() {
    return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
    const top = 50 + rand();
    const left = 50 + rand();

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

import {
    Select,
    Input,
    Textarea,
    Headding
} from '../../components'

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: '50%',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    action_button: {
        display: 'flex',
        justifyContent: 'center'
    }
}));

export default function AddDocumentationModal({ open, toggleModal }) {
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);
    const [file, setFile] = useState("");
    const [type, setType] = useState('pdf');

    const [documentValue, setdocumentValue] = useState({});

    const handleOnChange = (name, value) => {
        setdocumentValue(preValue => ({
            ...preValue,
            [name]: value
        }))
    }

    const onChange = async e => {
        // console.log(e.target.files[0])
        if (!e.target.files[0]) {
            return;
        }

        const data = await toBase64(e.target.files[0])
        //e.preventDefault();
        // setType(e.target.files[0].name.split('.').pop())
        setFile({ data });
        // setFileName(e.target.files[0].name);
    };

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });


    return (
        <Modal
            open={open}
            onClose={toggleModal}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
        >
            <div style={modalStyle} className={classes.paper}>
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
                            value={documentValue.name}
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

                        <Grid>
                            <FileViewer
                                fileType={type}
                                filePath={file}
                                errorComponent={<></>}
                                onError={(err) => {
                                    console.log(err)
                                }} />
                        </Grid>
                    }

                    <Grid item xs={6} className={classes.action_button}>
                        <Button variant="contained" color="secondary">
                            Cancel
                            </Button>
                    </Grid>
                    <Grid item xs={6} className={classes.action_button}>
                        <Button variant="contained" color="primary">
                            Save
      </Button>
                    </Grid>
                </Grid>
            </div>
        </Modal>
    );
}
