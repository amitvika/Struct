import React, { useState } from 'react';
import {
    Button,
    Paper,
    Grid,
    makeStyles
} from "@material-ui/core";

import FileUpload from "./FileUpload";
import GLTFRenderer from '../../../../gltf/GltfRenderer';
import { upload3DFile, getGLTFJson } from '../../../../api/fileUpload.api'
import { DEFAULTBACKCOLOR, DEFAULTSELECTCOLOR, DEFAULTTOUCHCOLOR, SELECTSOLID, SELECTHIRERACHY} from "../../../../gltf/Tree/utils";
const DEFAULTMATERIALNAME = "Basic";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        marginTop: 10,
        marginBottom: 10
    },
}));

export default function Index() {
    const classes = useStyles();
    const [gltfjson, setgltfjson] = useState({});
    const [fileId, setFileId] = useState(0);
    const [files, setFiles] = useState([])

    const handleFileUpload = (formData) => {
        upload3DFile(formData)
            .then(res => {
                setFiles([res.data])
                setFileId(res.data.id);
            })
            .catch(err => {
                console.log('Error -->> ', err)
            })
    }

    const getView = () => {
        getGLTFJson(fileId)
            .then(res => res.data)
            .then((data) => {
                setgltfjson(data)
            });

    };

    return (
        <Paper elevation={3} className={classes.paper}>
            <Grid container spacing={1}>
                <Grid item xs={12} >
                    <FileUpload
                        handleFileUpload={handleFileUpload}
                        getFiles={getView} />

                </Grid>
                <Grid item xs={12} >
                    {
                        Object.keys(gltfjson).length > 0 &&
                        <GLTFRenderer  
                            gltfjson={JSON.stringify(gltfjson)} 
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
                    {/* <CppTest /> */}
                </Grid>
                <Grid item xs={12} >
                    {/* <ThreeDViewer /> */}
                </Grid>
                <Grid item xs={4} >
                    {/* <Button color="primary"> Generate toolpath</Button> */}
                </Grid>
            </Grid>

        </Paper>

    );
}
