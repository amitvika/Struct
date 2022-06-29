import React, { useState } from 'react';
import { Button, Paper, Grid } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

import FileUpload from './FileUpload';
import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer';
import {
  upload3DFile,
  getGLTFJson
} from '@monostruct/common/api/fileUpload.api';
import {
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  //SELECTSOLID,
  SELECTHIRERACHY,
  SELECTFEATURE,
  STATEPROPS
} from '@monostruct/common/gltf/Tree/utils';
//const DEFAULTMATERIALNAME = 'Basic';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginTop: 10,
    marginBottom: 10
  }
}));

export default function ProcessConfigurationAssemblyForMachining(props) {
  const { activeGLTFFile, setActiveGLTFile } = props;
  const classes = useStyles();
  const [gltfjson, setgltfjson] = useState({});
  const [fileId, setFileId] = useState(0);
  const [files, setFiles] = useState([]);

  const handleFileUpload = (formData) => {
    upload3DFile(formData)
      .then((res) => {
        setFiles([res.data]);
        setFileId(res.data.id);
      })
      .catch((err) => {
        console.log('Error -->> ', err);
      });
  };

  const getView = () => {
    getGLTFJson(fileId)
      .then((res) => res.data)
      .then((data) => {
        setgltfjson(data);
      });
  };

  return (
    <Paper elevation={3} className={classes.paper}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FileUpload handleFileUpload={handleFileUpload} getFiles={getView} />
        </Grid>
        <Grid item xs={12}>
          {
            /*Object.keys(gltfjson).length > 0 &&*/ <GLTFRenderer
              //gltfjson={JSON.stringify(gltfjson)}
              gltfobj={[gltfjson]}
              activefile={fileId}
              backcolor={DEFAULTBACKCOLOR()}
              selectcolor={DEFAULTSELECTCOLOR()}
              touchcolor={DEFAULTTOUCHCOLOR()}
              selectedoption={SELECTFEATURE}
              splitmethod={SELECTHIRERACHY}
              changedata={[]}
              data2texture={null}
              data3texture={null}
              materialtype={STATEPROPS.materialname}
              whatchanged={0}
              dataselection={0}
              activeDataTable={0}
              edgecolor={STATEPROPS.edgecolor}
              activeGLTFFile={activeGLTFFile}
              setActiveGLTFile={setActiveGLTFile}
              xyzEndEffectorPosition={{ X: 0, Y: 0, Z: 0 }}
              setXYZEndEffectorPosition={null}
              xyzControlPosition={{ X: 0, Y: 0, Z: 0 }}
              setXYZControlPosition={null}
              xyzBeginPosition={{ X: 0, Y: 0, Z: 0 }}
              setXYZBeginPosition={null}
              xyzShiftPosition={{ X: 0, Y: 0, Z: 0 }}
              setXYZShiftPosition={null}
              kinematicParameters={{
                step: 1,
                error: 4,
                iterations: 21,
                methods: 1,
                gap: 0.001
              }}
              setKinematicParameters={null}
              itemProperties={null}
            />
          }
          {/* <CppTest /> */}
        </Grid>
        <Grid item xs={12}>
          {/* <ThreeDViewer /> */}
        </Grid>
        <Grid item xs={4}>
          {/* <Button color="primary"> Generate toolpath</Button> */}
        </Grid>
      </Grid>
    </Paper>
  );
}
