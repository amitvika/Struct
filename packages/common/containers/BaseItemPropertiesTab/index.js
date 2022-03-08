import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Paper, CircularProgress, Box } from '@mui/material';
import GeometryInput from './GeometryInput';
import get from 'lodash/get';

import {
  getHierarchySplitFiles,
  getAFileFromStore,
  resourcePathURL
} from '@monostruct/common/api/fileUpload.api';
import GLTFRenderer from '@monostruct/common/gltf/GltfRenderer';

import {
  DEFAULTBACKCOLOR,
  DEFAULTSELECTCOLOR,
  DEFAULTTOUCHCOLOR,
  SELECTHIRERACHY,
  STATEPROPS,
  USESTYLES,
  pollFunction,
  getFileNameWithoutExtension
} from '@monostruct/common/gltf/Tree/utils';
import LinearProgressBarTiming from '@monostruct/common/gltf/LinearProgressBarTiming';
import AssemblyTab from '@monostruct/common/containers/AssemblyTab';

export default function BaseItemProperties({
  itemId,
  itemProperties,
  setItemProperties,
  tabIndex,
  gltfjson,
  setgltfjson,
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
  setAllowFirstLevelItems,
  createAutoAssemblyOrder,
  setCreateAutoAssemblyOrder,
  createAutoStackability,
  setCreateAutoStackability,
  activeGLTFFile,
  setActiveGLTFile,
  isDesignSite
}) {
  const classes = USESTYLES();
  // const dispatch = useDispatch();

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

  useEffect(() => {
    setfileUUId(itemProperties.fileUUId);
    setGltfObj(gltfjson);
  }, [gltfjson]);

  useEffect(() => {
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
      let multiAssembly = false;
      let comparison_parameters = null;
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
        true,
        false,
        createAutoAssemblyOrder,
        createAutoStackability,
        STATEPROPS.explodegap,
        STATEPROPS.holescale,
        STATEPROPS.removegap,
        STATEPROPS.fromcenter,
        STATEPROPS.animationtime,
        false,
        itemProperties.id || itemProperties._id,
        itemProperties.name
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
          const statusRes = await pollFunction(
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
          multiAssembly = statusRes
            ? statusRes.data
              ? statusRes.data.assemblies > 1
              : false
            : false;
          treeLength = treeRes.data.length;

          setgltfjson({
            gltf: gltfRes.data,
            tree: treeRes.data,
            multiAssembly: multiAssembly,
            gdt: datagdt,
            treeLength: treeLength,
            resourcepath: resourcePathURL
          });
          console.log('Setting active gltf file to', datagdt);
          setActiveGLTFile(datagdt);
          comparison_parameters = statusRes.data ? statusRes.data : null;
          setItemProperties((prevData) => ({
            ...prevData,
            multiAssembly: multiAssembly,
            stepTreeLength: treeLength,
            comparison_parameters: comparison_parameters
          }));
        }
      } else {
        treeLength = get(getHierarchyRes.data, 'tree', []).length;
        multiAssembly = getHierarchyRes
          ? getHierarchyRes.data
            ? getHierarchyRes.data.status
              ? getHierarchyRes.data.status.assemblies > 1
              : false
            : false
          : false;
        setgltfjson({
          ...getHierarchyRes.data,
          multiAssembly: multiAssembly,
          gdt: datagdt,
          treeLength: treeLength
        });
        console.log('Setting active gltf file to', datagdt);
        setActiveGLTFile(datagdt);
        comparison_parameters = getHierarchyRes
          ? getHierarchyRes.data
            ? getHierarchyRes.data.status
              ? getHierarchyRes.data.status
              : null
            : null
          : null;
        setItemProperties((prevData) => ({
          ...prevData,
          multiAssembly: multiAssembly,
          stepTreeLength: treeLength,
          comparison_parameters: comparison_parameters
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
          multiAssembly: multiAssembly,
          stepTreeLength: treeLength,
          comparison_parameters: comparison_parameters,
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
        multiAssembly: multiAssembly,
        stepTreeLength: treeLength,
        comparison_parameters: comparison_parameters,
        distanceGap: distanceGaper,
        angleGap: angleGaper,
        drawLine: drawLiner
      });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsFileLoading(false);
    }
  };

  const removeFile = (data) => {};

  let gltfjsonlen = gltfobj ? Object.keys(gltfobj).length : 0;
  if (get(gltfobj, 'gltf.accessors')) {
    gltfjsonlen += gltfobj?.gltf?.accessors?.length;
  }

  return (
    <div>
      {
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
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
              {
                /*!isLoading &&
              Object.keys(gltfjson).length > 0 &&
              !isFileLoading &&*/ <GLTFRenderer
                  gltfobj={gltfobj}
                  fileGDT={itemProperties.fileGDT}
                  fileUUId={fileUUId}
                  fileAnimation={false}
                  activefile={
                    (fileId || fileUUId || '') +
                    gltfjsonlen.toString() +
                    tabIndex.toString()
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
                  activeGLTFFile={activeGLTFFile}
                  setActiveGLTFile={setActiveGLTFile}
                />
              }
              {isFileLoading && <CircularProgress />}
            </Paper>
            <Box className={classes.itemContainer}>
              <GeometryInput
                itemId={itemId}
                handleFileUpload={handleFileUpload}
                removeFile={removeFile}
                setItemProperties={setItemProperties}
                itemProperties={itemProperties}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
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
                percentage={percentager}
                setPercentage={setPercentager}
                setProgressBarLoad={setProgressBarLoader}
                setCurrentProgressText={setCurrentProgressTexter}
                setCompletionProgressText={setCompletionProgressTexter}
                setCenterActionText={setCenterActionTexter}
                {...{
                  allowFirstLevelItems,
                  setAllowFirstLevelItems,
                  createAutoAssemblyOrder,
                  setCreateAutoAssemblyOrder,
                  createAutoStackability,
                  setCreateAutoStackability,
                  handleItemSaveOnServer,
                  isDesignSite
                }}
              />
            </Box>
          </Box>

          <AssemblyTab />
        </Box>
      }
    </div>
  );
}
