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
import get from 'lodash/get';

import {
    Headding,
    FileUpload
} from '@ravibasil/common/components';
import { upload3DFile, getHierarchySplitFiles } from '@ravibasil/common/api/fileUpload.api'

import ItemAPI from '@ravibasil/common/api/items.api';

import GLTFRenderer from '@ravibasil/common/gltf/GltfRenderer';
import { showErrorAlert, showSuccessAlert } from '../../../actions/alert.action';
import { DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, SELECTSOLID, SELECTHIRERACHY, SELECTFEATURE } from "@ravibasil/common/gltf/Tree/utils";

import '../style.css';
import FileHistory from '@ravibasil/common/containers/FileHistory';

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
    const [fileName, setFileName] = useState("");
    const [gltfobj, setGltfObj] = useState(gltfjson);
    const [fileId, setFileId] = useState(0);
    const [files, setFiles] = useState([])
    const [isFileLoading, setIsFileLoading] = useState(false);
    const [selectedTab, setselectedTab] = useState("")
    const [value, setValue] = useState(2);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const tabArray = ['Source: Product Design', "Source: CAD"]

    // useEffect(() => {
    //   if (itemProperties.fileId) {
    //     getView(itemProperties.fileId)
    //   }
    // }, [])
    useEffect(() => {
        console.log("Setting gltf",gltfjson);
        setGltfObj(gltfjson);
    }, [gltfjson])

    const handleFileUpload = (data) => {

        setIsLoading(true);
        upload3DFile(data)
            .then(res => {
                setFiles([res.data])
                setFileId(res.data.id);
                getView(res.data.id);
                console.log("File Id:", fileId, fileName)

                // setItemProperties(prevData => ({
                //     ...prevData,
                //     fileId: res.data.id,
                //     fileStore: res.data.store
                // }));
                setIsLoading(false);
                dispatch(showSuccessAlert({ message: 'File uploaded successfully' }));

            })
            .catch(err => {
                setIsLoading(false);
                dispatch(showErrorAlert({ message: 'Unable to upload file at the moment' }));

            });

    }

    const getView = (fileId) => {
        setIsFileLoading(true)

        getHierarchySplitFiles(fileId, true, 0.1, 0.5, false, 0, 0, 0)
            .then(res => res.data)
            .then((data) => {
                setItemProperties(prevData => ({
                    ...prevData,
                    fileId: fileId,
                    fileStore: data.store,
                    fileGDT: null,
                    fileMPPS: null,
                    fileStack: null,
                    fileKinematic:null
                }));
                //console.log(itemProperties);
                const multiAssmebly = get(data, 'tree', []).length > 0;
                setgltfjson({ ...data, multiAssmebly: multiAssmebly, gdt: null });
                //console.log({...data,multiAssmebly:multiAssmebly});
                setIsFileLoading(false);

                dispatch(showSuccessAlert({ message: 'File rendered successfully' }));
            })
            .catch(error => {
                setIsFileLoading(false);
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
    let gltfjsonlen =  Object.keys(gltfobj).length;
    if (gltfjsonlen > 0) {
        gltfjsonlen += gltfobj?.gltf?.accessors?.length;
    }
    //console.log("After upload at the render",itemProperties,fileId,gltfjson);
    return (
        <div>
            {
                <>
                    <Grid style={{ display: 'flex' }}>
                        <Paper style={{ padding: 20, margin: 10, width: '40rem' }} >
                            {
                                !isLoading && Object.keys(gltfjson).length > 0 && !isFileLoading &&
                                <GLTFRenderer
                                    //gltfjson={JSON.stringify(gltfjson)}
                                    gltfobj={gltfobj}
                                    fileGDT={null}
                                    activefile={fileId+gltfjsonlen.toString()}
                                    backcolor={DEFAULTBACKCOLOR}
                                    selectcolor={DEFAULTSELECTCOLOR}
                                    touchcolor={DEFAULTTOUCHCOLOR}
                                    selectedoption={SELECTFEATURE}
                                    splitmethod={SELECTHIRERACHY}
                                    changedata={[]}
                                    data2texture={null}
                                    data3texture={null}
                                    materialtype={DEFAULTMATERIALNAME}
                                    whatchanged={0} dataselection={0}
                                />
                            }
                            {
                                (isLoading || isFileLoading) && <CircularProgress />
                            }

                        </Paper>
                        <Grid style={{ width: '60rem' }}>
                            <Paper style={{ padding: 20, margin: 10, fontWeight: 'bold' }}>
                                <Grid container  >
                                    {
                                        tabArray.map(tabName => (
                                            <Grid item xs={6} key={tabName}>

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
                                    <>
                                        <FileUpload  fileName={fileName} setFileName = {setFileName} handleFileUpload={handleFileUpload} itemId={itemId} />
                                        <FileHistory selectedFileName={fileName}
                                            link_id={fileId.id} />
                                    </>
                                }
                                {
                                    isLoading && <CircularProgress />
                                }
                            </Paper>
                            <GeometryInput setItemProperties={setItemProperties} itemProperties={itemProperties} />
                        </Grid>
                    </Grid>

                </>
            }

        </div >
    )
}