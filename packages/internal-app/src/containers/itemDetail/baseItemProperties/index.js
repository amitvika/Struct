import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import { Paper, CircularProgress, Box, LinearProgress /*, makeStyles*/ } from '@material-ui/core';
import { useDispatch } from 'react-redux';

import GeometryInput from './GeometryInput';
import get from 'lodash/get';

import {
  //upload3DFile,
  getHierarchySplitFiles,
  getAFileFromStore,
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
  pollFunction
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
  progressBarLoad,
  percentage
}) {
  const classes = USESTYLES();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isStepLoaded, setIsStepLoaded] = useState(false);
  const [percentager, setPercentager] = useState(percentage||0);
  const [progressBarLoader, setProgressBarLoader] = useState(progressBarLoad);
  const [gltfobj, setGltfObj] = useState(gltfjson);
  const [fileId, setFileId] = useState(0);
  const [fileUUId,setfileUUId]=useState(itemProperties.fileUUId);
  const [isFileLoading, setIsFileLoading] = useState(false);

  useEffect(() => {
    console.log('Setting gltf', gltfjson);
    setfileUUId(itemProperties.fileUUId);
    setGltfObj(gltfjson);
  }, [gltfjson]);
  
  useEffect(() => {
    setProgressBarLoader(progressBarLoad);
  }, [progressBarLoad]);
  
  useEffect(() => {
    if(percentage) {
      setPercentager(percentage);
    }
  }, [percentage]);

  const handleFileUpload = async (data) => {
    setIsLoading(true);

    try {
      //const fileUploadRes = await upload3DFile(data);
      //"uuid":uuid,"filename":newfilename,"bytes":fileswritten
      const fileId = data.uuid+"/"+data.filename;
      console.log("After File Upload", data);
      

      if (!fileId) {
        // eslint-disable-next-line no-throw-literal
        console.log("File Upload Error",data);
        throw { message: 'File upload error' };
      }
      setfileUUId(data.uuid);
      setItemProperties((prevData) => ({
        ...prevData,
        fileUUId: data.uuid,
      }));
      setProgressBarLoader(true);
      let percent = 0;
      const getHierarchyRes = await getHierarchySplitFiles(fileId, true, STATEPROPS.distancegap, STATEPROPS.anglegap, false, 0, 0, 0, STATEPROPS.maximumfaces);
      if(fileUUId != data.uuid) {
        setfileUUId(data.uuid);
      }
      let datastore = getHierarchyRes.data.store;
      let dataload = getHierarchyRes.data.load;
      const datastatus = getHierarchyRes.data.status;
     
      if(datastatus) {
        percent = datastatus.percent;
      } 
      setPercentager(percent);
      if(!datastore || (percent!=100)){
        if(data.file) {
          
          dataload = data.filename;
          let filenameWithExtension = dataload.replace(/^.*[\\\/]/, '');
          const lastDotIndex = filenameWithExtension.lastIndexOf('.');
          if(lastDotIndex==-1) {
            datastore = filenameWithExtension+"0";
          } else {
            datastore = filenameWithExtension.substring(0,lastDotIndex)+"0";
          }
          
        }
        handleItemSaveOnServer({
          fileId: null,
          fileUUId: data.uuid,
          fileStore: datastore,
          fileName: dataload,
          fileGDT: null,
          fileMPPS: null,
          fileStack: null,
          fileKinematic: null,
        });
        // eslint-disable-next-line no-throw-literal
        if(!datastore) {
          console.log("File Render Error",datastore,dataload);
          throw { message: 'Unable to render file' };
        } else {
          const datafile = data.uuid+"/"+datastore;
          let fetchStatus = () => getAFileFromStore(datafile,"status");
          let validateStatus = (result) => { 
            console.log(result.data,result.data.percent,result.data.percent!=100);
            return (result.data.percent!=100);
          };
          let percentFunction = (result) => result.data.percent?result.data.percent:percentager;
          console.log("Entering poll",datastore,dataload);
          await pollFunction(fetchStatus, validateStatus, 20000, setPercentager,percentFunction);
          console.log("Completing poll",datastore,dataload);
          const gltfRes = await getAFileFromStore(datafile,"gltf");
          const treeRes = await getAFileFromStore(datafile,"tree");
          const multiAssmebly = treeRes.data.length > 0;
          setgltfjson({ gltf:gltfRes.data, 
              tree:treeRes.data, 
              multiAssmebly: multiAssmebly, 
              gdt: null,
              treeLength: treeRes.data.length });
        }
        
      } else {
        handleItemSaveOnServer({
          fileId: null,
          fileUUId: data.uuid,
          fileStore: datastore,
          fileName: dataload,
          fileGDT: null,
          fileMPPS: null,
          fileStack: null,
          fileKinematic: null,
        });
        const treeLength = get(getHierarchyRes.data, 'tree', []).length;
        const multiAssmebly = treeLength > 0;
        setgltfjson({ ...getHierarchyRes.data, multiAssmebly: multiAssmebly, gdt: null, treeLength: treeLength });
      }
      setProgressBarLoader(false);
      if(fileUUId != data.uuid) {
        setfileUUId(data.uuid);
      }
      if(fileUUId != itemProperties.fileUUId) {
        setItemProperties((prevData) => ({
          ...prevData,
          fileUUId: data.uuid,
        }));
      }
      
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
            {progressBarLoader && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate"  value={percentager.toFixed(3)} />
              </Box>
            )}
            {!isLoading &&
              Object.keys(gltfjson).length > 0 &&
              !isFileLoading && (
                <GLTFRenderer
                  gltfobj={gltfobj}
                  fileGDT={null}
                  fileUUId={fileUUId}
                  fileAnimation={false}
                  activefile={(fileId || fileUUId || '') + gltfjsonlen.toString()}
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
