import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import { Paper, CircularProgress, makeStyles } from '@material-ui/core';
import { useDispatch } from 'react-redux';

import GeometryInput from './GeometryInput';
import get from 'lodash/get';

import {
  upload3DFile,
  getHierarchySplitFiles,
} from '@monostruct/common/api/fileUpload.api';

import ItemAPI from '@monostruct/common/api/items.api';

import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer';
import {
  showErrorAlert,
  showSuccessAlert,
} from '../../../actions/alert.action';
import {
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  SELECTHIRERACHY,
  SELECTFEATURE,
} from '@monostruct/common/gltf/Tree/utils';

import '../style.css';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    '@media screen and (max-width:1400px)': {
      width: '100%',
      flexDirection: 'column-reverse',
    },
  },
  paperContainer: {
    padding: 20,
    margin: 10,
    width: '75%',
    '@media screen and  (max-width:1400px)': {
      width: '100%',
    },
  },
  itemContainer: {
    width: '25%',
    '@media screen and (max-width:1400px)': {
      width: '100%',
    },
  },
}));

const DEFAULTMATERIALNAME = 'Basic';
export default function BaseItemProperties({
  itemId,
  itemProperties,
  setItemProperties,
  gltfjson,
  setgltfjson,
}) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isStepLoaded, setIsStepLoaded] = useState(false);
  // const [threejsObject, setThreejsObject] = useState({});
  // const [fileName, setFileName] = useState('');
  const [gltfobj, setGltfObj] = useState(gltfjson);
  const [fileId, setFileId] = useState(0);
  // const [files, setFiles] = useState([]);
  const [isFileLoading, setIsFileLoading] = useState(false);

  useEffect(() => {
    console.log('Setting gltf', gltfjson);
    setGltfObj(gltfjson);
  }, [gltfjson]);

  const handleFileUpload = (data) => {
    setIsLoading(true);
    upload3DFile(data)
      .then((res) => {
        console.log('Getting Resources', res, res.data);
        // setFiles([res.data]);
        setFileId(res.data.id);
        getView(res.data.id);

        // setItemProperties(prevData => ({
        //     ...prevData,
        //     fileId: res.data.id,
        //     fileStore: res.data.store
        // }));
        setIsLoading(false);
        dispatch(showSuccessAlert({ message: 'File uploaded successfully' }));
      })
      .catch((err) => {
        setIsLoading(false);
        dispatch(
          showErrorAlert({ message: 'Unable to upload file at the moment' })
        );
      });
  };

  const getView = (fileId) => {
    setIsFileLoading(true);

    getHierarchySplitFiles(fileId, true, 0.1, 0.5, false, 0, 0, 0)
      .then((res) => res.data)
      .then((data) => {
        setItemProperties((prevData) => ({
          ...prevData,
          fileId: fileId,
          fileStore: data.store,
          fileGDT: null,
          fileMPPS: null,
          fileStack: null,
          fileKinematic: null,
        }));
        //console.log(itemProperties);
        const multiAssmebly = get(data, 'tree', []).length > 0;
        setgltfjson({ ...data, multiAssmebly: multiAssmebly, gdt: null });
        //console.log({...data,multiAssmebly:multiAssmebly});
        setIsFileLoading(false);

        dispatch(showSuccessAlert({ message: 'File rendered successfully' }));
      })
      .catch((error) => {
        setIsFileLoading(false);
        dispatch(showErrorAlert({ message: 'Unable to render file' }));
      });
  };

  const removeFile = (data) => {
    // setIsLoading(true);
    ItemAPI.deleteItemGeomtery(itemId)
      .then((res) => {
        // setThreejsObject({});
        setIsStepLoaded(false);
      })
      .catch((error) => {
        // setIsLoading(false);
      });
  };
  // const handleTabChange2 = (tabName) => {
  //   if (tabName === selectedTab) {
  //     setselectedTab('');
  //   } else {
  //     setselectedTab(tabName);
  //   }
  // };
  let gltfjsonlen = Object.keys(gltfobj).length;
  if (gltfjsonlen > 0) {
    gltfjsonlen += gltfobj?.gltf?.accessors?.length;
  }
  //console.log("After upload at the render",itemProperties,fileId,gltfjson);
  return (
    <div>
      {
        <Grid className={classes.container}>
          <Paper className={classes.paperContainer} variant="outlined" square>
            {!isLoading && Object.keys(gltfjson).length > 0 && !isFileLoading && (
              <GLTFRenderer
                //gltfjson={JSON.stringify(gltfjson)}
                gltfobj={gltfobj}
                fileGDT={null}
                fileAnimation={false}
                activefile={fileId + gltfjsonlen.toString()}
                backcolor={DEFAULTBACKCOLOR}
                selectcolor={DEFAULTSELECTCOLOR}
                touchcolor={DEFAULTTOUCHCOLOR}
                selectedoption={SELECTFEATURE}
                splitmethod={SELECTHIRERACHY}
                changedata={[]}
                data2texture={null}
                data3texture={null}
                materialtype={DEFAULTMATERIALNAME}
                whatchanged={0}
                dataselection={0}
              />
            )}
            {(isLoading || isFileLoading) && <CircularProgress />}
          </Paper>
          <Grid className={classes.itemContainer}>
            <GeometryInput
              isLoading={isLoading}
              itemId={itemId}
              handleFileUpload={handleFileUpload}
              removeFile={removeFile}
              setItemProperties={setItemProperties}
              itemProperties={itemProperties}
            />
          </Grid>
        </Grid>
      }
    </div>
  );
}
