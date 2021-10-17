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
  STATEPROPS,
  USESTYLES,
} from '@monostruct/common/gltf/Tree/utils';

import '../style.css';

/* const useStyles = makeStyles((theme) => ({
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
})); */

//const DEFAULTMATERIALNAME = 'Basic';
export default function BaseItemProperties({
  itemId,
  itemProperties,
  setItemProperties,
  gltfjson,
  setgltfjson,
  handleItemUpdateLocallay,
  handleItemSaveOnServer,
}) {
  const classes = USESTYLES();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isStepLoaded, setIsStepLoaded] = useState(false);

  const [gltfobj, setGltfObj] = useState(gltfjson);
  const [fileId, setFileId] = useState(0);

  const [isFileLoading, setIsFileLoading] = useState(false);

  useEffect(() => {
    console.log('Setting gltf', gltfjson);
    setGltfObj(gltfjson);
  }, [gltfjson]);

  const handleFileUpload = async (data) => {
    setIsLoading(true);

    try {
      const fileUploadRes = await upload3DFile(data);

      const fileId = fileUploadRes.data.id
      if (!fileId) {
        // eslint-disable-next-line no-throw-literal
        throw { message: 'File upload error' };
      }

      const getHierarchyRes = await getHierarchySplitFiles(fileId, true, 0.1, 0.5, false, 0, 0, 0, 50)

      if(!getHierarchyRes.data.store){
        // eslint-disable-next-line no-throw-literal
        throw { message: 'Unable to render file' };
      }

      handleItemSaveOnServer({
        fileId: fileId,
        fileStore: getHierarchyRes.data.store,
        fileName: getHierarchyRes.data.load,
        fileGDT: null,
        fileMPPS: null,
        fileStack: null,
        fileKinematic: null,
      });

      const multiAssmebly = get(getHierarchyRes.data, 'tree', []).length > 0;
      setgltfjson({ ...getHierarchyRes.data, multiAssmebly: multiAssmebly, gdt: null });
      setIsLoading(false);
      
      dispatch(showSuccessAlert({ message: 'File uploaded and Rendered successfully' }));
      
    } catch (error) {
      setIsLoading(false);
      dispatch(showErrorAlert({ message: error.message }));
    }

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
  let gltfjsonlen = Object.keys(gltfobj).length;
  if (gltfjsonlen > 0) {
    gltfjsonlen += gltfobj?.gltf?.accessors?.length;
  }
  
  return (
    <div>
      {
        <Grid className={classes.designcontainer}>
          <Paper className={classes.paperContainer} variant="outlined" square>
            {!isLoading &&
              Object.keys(gltfjson).length > 0 &&
              !isFileLoading && (
                <GLTFRenderer
                  gltfobj={gltfobj}
                  fileGDT={null}
                  fileAnimation={false}
                  activefile={fileId + gltfjsonlen.toString()}
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
