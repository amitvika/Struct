import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import {
  Paper,
  CircularProgress,
  Box
  /*LinearProgress,
  makeStyles*/
} from '@material-ui/core';
import { useDispatch } from 'react-redux';

import GeometryInput from './GeometryInput';
import get from 'lodash/get';

import {
  //upload3DFile,
  getHierarchySplitFiles,
  getAFileFromStore,
  resourcePathURL
} from '@monostruct/common/api/fileUpload.api';

import ItemAPI from '@monostruct/common/api/items.api';

import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer';
import {
  showErrorAlert,
  showSuccessAlert
} from '../../../actions/alert.action';
import {
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  SELECTHIRERACHY,
  SELECTFEATURE,
  STATEPROPS,
  USESTYLES,
  pollFunction,
  getFileNameWithoutExtension
} from '@monostruct/common/gltf/Tree/utils';

import LinearProgressBarTiming from '@monostruct/common/gltf/LinearProgressBarTiming';

import '../style.css';
import { createChildItems } from './helper';

export default function BaseItemProperties({
  itemId,
  itemProperties,
  setItemProperties,
  gltfjson,
  setgltfjson,
  handleItemUpdateLocallay,
  handleItemSaveOnServer,
  progressBarLoad,
  percentage,
  currentProgressText,
  completionProgressText,
  centerActionText,
  drawLine,
  distanceGap,
  angleGap,
  selectedOption,
  setSelectedOption,
  allowFirstLevelItems,
  setAllowFirstLevelItems
}) {
  const classes = USESTYLES();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isStepLoaded, setIsStepLoaded] = useState(false);
  const [gltfobj, setGltfObj] = useState(gltfjson);
  const [fileId, setFileId] = useState(0);
  const [fileUUId, setfileUUId] = useState(itemProperties.fileUUId);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [percentager, setPercentager] = useState(percentage || 0);
  const [progressBarLoader, setProgressBarLoader] = useState(progressBarLoad);
  const [currentProgressTexter, setCurrentProgressTexter] =
    useState(currentProgressText);
  const [completionProgressTexter, setCompletionProgressTexter] = useState(
    completionProgressText
  );
  const [centerActionTexter, setCenterActionTexter] =
    useState(centerActionText);
  const [progressBarRender, setProgressBarRender] = useState(false);
  const [distanceGaper, setDistanceGaper] = useState(
    distanceGap ? distanceGap : STATEPROPS.distancegap
  );
  const [angleGaper, setAngleGaper] = useState(
    angleGap ? angleGap : STATEPROPS.anglegap
  );
  const [drawLiner, setDrawLiner] = useState(drawLine);
  //const [allowFirstLevelItems, setAllowFirstLevelItems] = useState(false);
  // console.log(
  //   'ANgle Gap',
  //   angleGap,
  //   angleGaper,
  //   'Distance Gap',
  //   distanceGap,
  //   distanceGaper
  // );
  useEffect(() => {
    //console.log('Setting gltf', gltfjson);
    setfileUUId(itemProperties.fileUUId);
    setGltfObj(gltfjson);
  }, [gltfjson]);

  useEffect(() => {
    //console.log('Setting itemProperties', itemProperties);
    setfileUUId(itemProperties.fileUUId);
  }, [itemProperties]);

  useEffect(() => {
    setProgressBarLoader(progressBarLoad);
  }, [progressBarLoad]);

  useEffect(() => {
    setCurrentProgressTexter(currentProgressText);
  }, [currentProgressText]);

  useEffect(() => {
    setCompletionProgressTexter(completionProgressText);
  }, [completionProgressText]);

  useEffect(() => {
    setCenterActionTexter(centerActionText);
  }, [centerActionText]);

  useEffect(() => {
    if (percentage) {
      setPercentager(percentage);
    }
  }, [percentage]);

  useEffect(() => {
    //console.log('Setting itemProperties', itemProperties);
    setDrawLiner(drawLine);
  }, [drawLine]);

  useEffect(() => {
    //console.log('Setting distanceGap', distanceGap, distanceGaper);
    if (distanceGap && distanceGap > 0) {
      setDistanceGaper(distanceGap);
    }
  }, [distanceGap]);

  useEffect(() => {
    //console.log('Setting angleGap', angleGap, angleGaper);
    if (angleGap && angleGap > 0) {
      setAngleGaper(angleGap);
    }
  }, [angleGap]);

  const handleFileUpload = async (data) => {
    setIsLoading(true);

    try {
      //const fileUploadRes = await upload3DFile(data);
      //"uuid":uuid,"filename":newfilename,"bytes":fileswritten
      const fileId = data.uuid + '/' + data.filename;
      //console.log('After File Upload', data);

      if (!data.uuid || !data.filename) {
        // eslint-disable-next-line no-throw-literal
        // console.log('File Upload Error', data);
        setIsLoading(false);
        throw { message: 'File upload error' };
      }
      let dataload = '';
      let datastore = '';
      let datagdt = '';
      let treeLength = 0;
      dataload = data.filename;
      /*let filenameWithOutExtension = dataload.replace(/^.*[\\\/]/, '');
      const lastDotIndex = filenameWithOutExtension.lastIndexOf('.');
      if (lastDotIndex != -1) {
        filenameWithOutExtension = filenameWithOutExtension.substring(
          0,
          lastDotIndex
        );
      }*/
      let filenameWithOutExtension = getFileNameWithoutExtension(dataload);
      datastore = filenameWithOutExtension + '0';
      datagdt = filenameWithOutExtension + '3';

      setfileUUId(data.uuid);

      setProgressBarLoader(true);
      setIsFileLoading(true);
      if (
        datastore != itemProperties.fileStore ||
        dataload != itemProperties.filename ||
        data.uuid != itemProperties.fileUUId
      ) {
        setItemProperties((prevData) => ({
          ...prevData,
          fileUUId: data.uuid,
          fileStore: datastore,
          fileName: dataload,
          distanceGap: distanceGaper,
          angleGap: angleGaper,
          drawLine: drawLiner
        }));
        handleItemSaveOnServer({
          fileId: null,
          fileUUId: data.uuid,
          fileStore: datastore,
          fileName: dataload,
          fileGDT: null,
          fileMPPS: null,
          fileStack: null,
          fileKinematic: null,
          distanceGap: distanceGaper,
          angleGap: angleGaper,
          drawLine: drawLiner
        });
      }
      let percent = 0;
      const getHierarchyRes = await getHierarchySplitFiles(
        fileId,
        true,
        distanceGaper,
        angleGaper,
        false,
        0,
        STATEPROPS.edgesize,
        0,
        STATEPROPS.maximumfaces,
        true,
        true
      );
      setIsFileLoading(false);
      if (fileUUId != data.uuid) {
        setfileUUId(data.uuid);
      }
      const datastatus = getHierarchyRes.data.status;
      if (datastatus) {
        percent = datastatus.percent;
        if (
          datagdt != getHierarchyRes.data.store ||
          dataload != getHierarchyRes.data.load ||
          itemProperties.fileUUId != data.uuid ||
          itemProperties.fileGDT != datagdt
        ) {
          datagdt = getHierarchyRes.data.store;
          dataload = getHierarchyRes.data.load;
          if (itemProperties.fileUUId != data.uuid) {
            setItemProperties((prevData) => ({
              ...prevData,
              fileUUId: data.uuid,
              fileStore: datastore,
              fileGDT: datagdt,
              fileName: dataload,
              distanceGap: distanceGaper,
              angleGap: angleGaper,
              drawLine: drawLiner
            }));
          }
          handleItemSaveOnServer({
            fileId: null,
            fileUUId: data.uuid,
            fileStore: datastore,
            fileName: dataload,
            fileGDT: datagdt,
            fileMPPS: null,
            fileStack: null,
            fileKinematic: null,
            distanceGap: distanceGaper,
            angleGap: angleGaper,
            drawLine: drawLiner
          });
        }
      }

      setPercentager(percent);

      if (!datastatus || percent != 100) {
        // eslint-disable-next-line no-throw-literal
        if (!datagdt || !datastatus) {
          // console.log('File Render Error', datagdt, dataload);
          setProgressBarLoader(false);
          setIsLoading(false);
          throw { message: 'Unable to render file' };
        } else {
          const datafile = data.uuid + '/' + datagdt;
          let fetchStatus = () => getAFileFromStore(datafile, 'status');
          let validateStatus = (result) => {
            // console.log(
            //   result.data,
            //   result.data.percent,
            //   result.data.percent != 100
            // );
            return result.data.percent != 100;
          };
          let percentFunction = (result) =>
            result.data.percent ? result.data.percent : percentager;
          // console.log('Entering poll', datagdt, dataload);
          await pollFunction(
            fetchStatus,
            validateStatus,
            20000,
            setPercentager,
            percentFunction,
            setCurrentProgressTexter,
            setCompletionProgressTexter
          );
          // console.log('Completing poll', datagdt, dataload);
          const gltfRes = await getAFileFromStore(datafile, 'gltf');
          const treeRes = await getAFileFromStore(datafile, 'tree');

          treeLength = treeRes.data.length;

          setgltfjson({
            gltf: gltfRes.data,
            tree: treeRes.data,
            multiAssmebly: treeLength > 0,
            gdt: datagdt,
            treeLength: treeLength,
            resourcepath: resourcePathURL
          });
          setItemProperties((prevData) => ({
            ...prevData,
            multiAssmebly: treeLength > 0,
            stepTreeLength: treeLength
          }));
        }
      } else {
        treeLength = get(getHierarchyRes.data, 'tree', []).length;
        setgltfjson({
          ...getHierarchyRes.data,
          multiAssmebly: treeLength > 0,
          gdt: datagdt,
          treeLength: treeLength
        });
        setItemProperties((prevData) => ({
          ...prevData,
          multiAssmebly: treeLength > 0,
          stepTreeLength: treeLength
        }));
      }

      setProgressBarLoader(false);
      if (fileUUId != data.uuid) {
        setfileUUId(data.uuid);
      }
      if (itemProperties.fileUUId != data.uuid) {
        setItemProperties((prevData) => ({
          ...prevData,
          fileUUId: data.uuid,
          fileStore: datastore,
          fileGDT: datagdt,
          fileName: dataload,
          multiAssmebly: treeLength > 0,
          stepTreeLength: treeLength,
          distanceGap: distanceGaper,
          angleGap: angleGaper,
          drawLine: drawLiner
        }));
      }

      handleItemSaveOnServer({
        fileId: null,
        fileUUId: data.uuid,
        fileStore: datastore,
        fileName: dataload,
        fileGDT: datagdt,
        fileMPPS: null,
        fileStack: null,
        fileKinematic: null,
        multiAssmebly: treeLength > 0,
        stepTreeLength: treeLength,
        distanceGap: distanceGaper,
        angleGap: angleGaper,
        drawLine: drawLiner,
        is_child_created: allowFirstLevelItems
      });

      if (allowFirstLevelItems) {
        createChildItems({
          pathFileName: filenameWithOutExtension,
          fileUUId: data.uuid,
          parentId: itemProperties.id
        });
      }

      setIsLoading(false);
      dispatch(showSuccessAlert({ message: 'File Parsed successfully' }));
    } catch (error) {
      setIsLoading(false);
      setIsFileLoading(false);
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
            {(progressBarLoader || progressBarRender) && (
              <Box sx={{ width: '100%' }}>
                <LinearProgressBarTiming
                  value={percentager}
                  currentProgressText={currentProgressTexter}
                  completionProgressText={completionProgressTexter}
                  centerActionText={centerActionTexter}
                  progressBarRender={progressBarRender}
                />
              </Box>
            )}
            {!isLoading &&
              Object.keys(gltfjson).length > 0 &&
              !isFileLoading && (
                <GLTFRenderer
                  gltfobj={gltfobj}
                  fileGDT={itemProperties.fileGDT}
                  fileUUId={fileUUId}
                  fileAnimation={false}
                  activefile={
                    (fileId || fileUUId || '') + gltfjsonlen.toString()
                  }
                  backcolor={DEFAULTBACKCOLOR()}
                  selectcolor={DEFAULTSELECTCOLOR()}
                  touchcolor={DEFAULTTOUCHCOLOR()}
                  selectedoption={selectedOption}
                  setSelectedOption={setSelectedOption}
                  splitmethod={SELECTHIRERACHY}
                  changedata={[]}
                  data2texture={null}
                  data3texture={null}
                  materialtype={STATEPROPS.materialname}
                  whatchanged={0}
                  dataselection={0}
                  activeDataTable={0}
                  setProgressBarRender={setProgressBarRender}
                  setPercentage={setPercentager}
                  setProgressBarLoad={setProgressBarLoader}
                  setCurrentProgressText={setCurrentProgressTexter}
                  setCompletionProgressText={setCompletionProgressTexter}
                  setCenterActionText={setCenterActionTexter}
                  drawLine={drawLiner}
                  edgecolor={STATEPROPS.edgecolor}
                />
              )}
            {isFileLoading && <CircularProgress />}
          </Paper>
          <Grid className={classes.itemContainer}>
            <GeometryInput
              itemId={itemId}
              handleFileUpload={handleFileUpload}
              removeFile={removeFile}
              setItemProperties={setItemProperties}
              itemProperties={itemProperties}
              isFileLoading={isFileLoading}
              setIsFileLoading={setIsFileLoading}
              label={'STEP, IGES, BREP, STL'}
              distanceGap={distanceGaper}
              setDistanceGap={setDistanceGaper}
              angleGap={angleGaper}
              setAngleGap={setAngleGaper}
              drawLine={drawLiner}
              setDrawLine={setDrawLiner}
              setProgressBarRender={setProgressBarRender}
              setPercentage={setPercentager}
              setProgressBarLoad={setProgressBarLoader}
              setCurrentProgressText={setCurrentProgressTexter}
              setCompletionProgressText={setCompletionProgressTexter}
              setCenterActionText={setCenterActionTexter}
              {...{
                allowFirstLevelItems,
                setAllowFirstLevelItems,
                handleItemSaveOnServer
              }}
            />
          </Grid>
        </Grid>
      }
    </div>
  );
}
