import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';
import {
    Button,
    Snackbar,
    Paper,
    CircularProgress, Tab,
    Tabs,
} from "@material-ui/core";
import AppBar from '@material-ui/core/AppBar';
import { useDispatch } from 'react-redux';

import GeometryInput from './GeometryInput';
import { makeStyles } from '@material-ui/core/styles';


import {
    Headding,
    FileUpload
} from '@ravibasil/common/components';
import { upload3DFile, getHierarchySplitFiles } from '@ravibasil/common/api/fileUpload.api'

import ItemAPI from '@ravibasil/common/api/items.api';

import GLTFRenderer from '../../../gltf/GltfRenderer';
import { showErrorAlert, showSuccessAlert } from '../../../actions/alert.action';
import { DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, SELECTSOLID, SELECTHIRERACHY } from "../../../gltf/Tree/utils";

import '../style.css';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    tabPaper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        cursor: 'pointer',
        transition: '0.3s',
        "&:hover, &:focus": {
            backgroundColor: '#DCDCDC'
        }
    },
}));
const DEFAULTMATERIALNAME = "Basic";
export default function BaseItemProperties({ itemId, itemProperties, setItemProperties, gltfjson, setgltfjson }) {
    const dispatch = useDispatch()
    const classes = useStyles();
    const [isLoading, setIsLoading] = useState(false);
    const [isStepLoaded, setIsStepLoaded] = useState(false);
    const [threejsObject, setThreejsObject] = useState({});

    const [fileId, setFileId] = useState(0);
    const [files, setFiles] = useState([])
    const [isFileLoadingLoading, setIsFileLoadingLoading] = useState(false);
    const [selectedTab, setselectedTab] = useState("")
    const [value, setValue] = React.useState(2);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const tabArray = ['Source: Product Design', "Source: CAD"]

    // useEffect(() => {
    //   if (itemProperties.fileId) {
    //     getView(itemProperties.fileId)
    //   }
    // }, [])

    const handleFileUpload = (data) => {
        setIsLoading(true);
        upload3DFile(data)
            .then(res => {
                setFiles([res.data])
                setFileId(res.data.id);
                getView(res.data.id);

                setItemProperties(prevData => ({
                    ...prevData,
                    fileId: res.data.id
                }));

                dispatch(showSuccessAlert({ message: 'File uploaded successfully' }));

            })
            .catch(err => {
                dispatch(showErrorAlert({ message: 'Unable to upload file at the moment' }));
                setIsLoading(false);
            });
        setIsLoading(false);
    }

    const getView = (fileId) => {
        setIsFileLoadingLoading(true)

        getHierarchySplitFiles(fileId, true, 0.1, 0.5, false, 0, 0, 0)        
            .then(res => res.data)
            .then((data) => {
                setItemProperties(prevData => ({
                    ...prevData,
                    gltfjson: data
                }));

                setgltfjson(data)
                setIsFileLoadingLoading(false);

                dispatch(showSuccessAlert({ message: 'File rendered successfully' }));
            })
            .catch(error => {
                setIsFileLoadingLoading(false);
                dispatch(showErrorAlert({ message: 'Unable to render file' }));
            })
    };

    const removeFile = (data) => {
        // setIsLoading(true);
        ItemAPI
            .deleteItemGeomtery(itemId)
            .then(res => {
                setThreejsObject({})
                setIsStepLoaded(false);


            })
            .catch(error => {
                // setIsLoading(false);
            })
    }
    const handleTabChange2 = (tabName,) => {
        if (tabName === selectedTab) {
            setselectedTab('');
        }
        else {
            setselectedTab(tabName);

        }
    }
    return (
        <div>
            {
                <>
                    <Paper style={{ padding: 20, margin: 10 ,fontWeight: 'bold'}}>
                            <Grid container  >
                                {
                                    tabArray.map(tabName => (
                                        <Grid item xs={6}>

                                            <Paper onClick={() => handleTabChange2(tabName)} style={{
                                                backgroundColor: selectedTab === tabName ? "#777c80" : "",
                                                color: selectedTab === tabName ? "white" : ""
                                            }}
                                                className={classes.tabPaper}>{tabName}</Paper>

                                        </Grid>
                                    )
                                    )
                                }
                            </Grid>

                        <Headding fontSize={24} bold title={'Upload Cad'} />
                        {isStepLoaded ?
                            <Button
                                className="mt-2 mb-3"
                                variant="contained"
                                color="primary"
                                onClick={removeFile}>
                                Clear File
                    </Button>
                            :
                            <FileUpload handleFileUpload={handleFileUpload} itemId={itemId} />
                        }
                        {
                            isLoading && <CircularProgress />
                        }
                    </Paper>
                    <GeometryInput setItemProperties={setItemProperties} itemProperties={itemProperties} />

                </>
            }
            <Paper style={{ padding: 20, margin: 10 }} square={true}>
                {
                    Object.keys(gltfjson).length > 0 && !isFileLoadingLoading &&
                    <GLTFRenderer
                        //gltfjson={JSON.stringify(gltfjson)}
                        gltfobj={gltfjson}
                        activefile={fileId}
                        backcolor={DEFAULTBACKCOLOR}
                        selectcolor={DEFAULTSELECTCOLOR}
                        touchcolor={DEFAULTTOUCHCOLOR}
                        selectedoption={SELECTSOLID}
                        splitmethod={SELECTHIRERACHY}
                        changedata={[]}
                        data2texture={null}
                        data3texture={null}
                        materialtype={DEFAULTMATERIALNAME}
                        whatchanged={0} dataselection={0}
                    />
                }
                {
                    isFileLoadingLoading && <CircularProgress />
                }

            </Paper>
        </div >
    )
}
