import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Button,
  Paper,
  Tab,
  Tabs,
  Grid
  //Box,
  //LinearProgress
} from '@material-ui/core';
import SubHeaderWithArrow from '../../components/SubHeaderWithArrow';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import BaseItemProperties from './baseItemProperties';
import { createChildItems } from './baseItemProperties/helper';
import GeometricDimensioning from './geometricDimensioning';
import CurrentUsage from './currentUsage';
import VendorDetails from './VendorDetails';
import ManufactureProcessingProcessSimulation from '@monostruct/common/containers/ManufactureProcessingProcessSimulation';
import ClientSetup from './clientSetup';
import Assembly from './assembly';
import Production from './production';
import SurfaceFinishAndTreatment from './SurfaceFinishAndTreatment';
import ComplianceAndCertifications from './ComplianceAndCertifications';
// import DetailComponentInnerHeader from '@monostruct/common/components/DetailComponentInnerHeader';

import ItemTypeConfigurations from '../itemTypeConfigurations';
import ItemAPI from '@monostruct/common/api/items.api';

import {
  SELECTFEATURE,
  STATEPROPS,
  pollFunction,
  isEmptyObjectDictionary
  //isFileExistingInServer,
  //checkDBNull
} from '@monostruct/common/gltf/Tree/utils';

import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { setCurrentItemAction } from '../../actions/itemActions';
import get from 'lodash/get';
import { useQuery } from '../../utils/customHooks';
import './style.css';
import {
  getPartsStackableInfo,
  getPartsAssemblyOrder,
  getPartsKinematicOrder,
  getHierarchySplitFiles,
  getAFileFromStore,
  //getGltfForStore,
  //getTreeForStore,
  resourcePathURL,
  resourceStatusURL,
  isFileExistingInServer,
  //resourcePathS3URL,
  checkExistingPathFromStore,
  getAFileFromURLStore
} from '@monostruct/common/api/fileUpload.api';
import LoadingModal from '@monostruct/common/components/LoadingModal';

import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import Classification from '../classification';
import EditItemTitle from './EditItemTitle';
import ProductDesignSetup from '../productDesignSetup';
import { Box } from '@mui/system';
import { useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Headding } from 'src/components';
import ClipboardText from '@monostruct/common/components/ClipboardText';

let state_additionalSaveFunction = null;
const ItemDetail = ({ itemValue }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  let { id } = useParams();
  let query = useQuery();

  // const [state, dispatch] = useReducer(reducer, initialState);

  const currentItem = useSelector((state) => state.item.currentItem);
  const [tabIndex, setTabIndex] = useState('pdcu');
  const [itemProperties, setItemProperties] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [gltfjson, setgltfjson] = useState({});
  const parserNeeded = ['pdcu', 'gdtac', 'iupc', 'assembly'];
  const [percentage, setPercentage] = useState(0);
  const [currentProgressText, setCurrentProgressText] = useState(null);
  const [completionProgressText, setCompletionProgressText] = useState(null);
  const [centerActionText, setCenterActionText] = useState(null);
  const [progressBarLoad, setProgressBarLoad] = useState(false);
  const [internalProductConfig, setInternalProductConfig] = useState(null);
  const [selectedOption, setSelectedOption] = useState(SELECTFEATURE);
  const [allowFirstLevelItems, setAllowFirstLevelItems] = useState(false);
  const [createAutoAssemblyOrder, setCreateAutoAssemblyOrder] = useState(false);
  const [createAutoStackability, setCreateAutoStackability] = useState(false);

  useEffect(() => {
    let myTabIndex = 'pdcu';
    if (query.get('tab')) {
      myTabIndex = query.get('tab');
      setTabIndex(myTabIndex);
    }

    const toFetchItem =
      !itemProperties || (!itemProperties.fileId && !itemProperties.fileUUId);
    if (toFetchItem) {
      (async () => {
        dispatch(setCurrentItemAction(itemValue));
        console.log(
          'Setting item properties from set current action statement',
          itemValue
        );
        setItemProperties(itemValue);
        setGLTFAndTree({ ...itemValue }, myTabIndex);
        //console.log("coiming",itemValue);
      })();
    } else {
      setGLTFAndTree({ ...itemProperties }, myTabIndex);
      //console.log("goiming",itemProperties);
    }
  }, [tabIndex]);

  useEffect(() => {
    if (currentItem) {
      console.log('I am setting currentitem as itemproperties', currentItem);
      setItemProperties(currentItem);
    }
  }, [currentItem]);

  useEffect(() => {
    CriteriaUploadAPI.fetchCriteriaUpload(
      `type=Internal Use Product Configuration`
    )
      .then((resp) => {
        if (get(resp, 'data[0]')) {
          setInternalProductConfig(get(resp, 'data[0]'));
        }
      })
      .catch((error) => {});
  }, []);

  const getResourcePathURL = (item) => {
    if (item.fileUUId) {
      return (resourcePathURL || '') + item.fileUUId + '/';
    }
    return resourcePathURL || '';
  };
  const getStatusPathURL = (item) => {
    if (item.fileUUId) {
      return item.fileUUId + '/';
    }
    return '';
  };

  const getStepFile = (item) => {
    if (item.fileUUId) {
      const fullpath = item.fileName;
      return fullpath.slice(6, fullpath.length);
    }
    return item.fileId;
  };

  const checkStatusToParse = async (whichOneToLoad, whichOneToStatus) => {
    const myResourcePath = await checkExistingPathFromStore(
      whichOneToStatus,
      'gltf',
      true
    );
    if (myResourcePath) {
      //console.log('Found gltf', whichOneToLoad);
      return 0;
    }
    const statusURL = `${resourceStatusURL}${whichOneToStatus}.status`;
    //console.log('Checking Existing', statusURL);
    if (isFileExistingInServer(statusURL)) {
      //console.log('Found status', whichOneToLoad);
      const statusRes = await getAFileFromStore(whichOneToStatus, 'status');
      let percent = 0;
      if (
        statusRes &&
        statusRes.data &&
        !isEmptyObjectDictionary(statusRes.data)
      ) {
        //console.log('Status Result', statusRes, statusRes.data);
        percent = statusRes.data.percent;
        if (percent == 100) {
          return 0;
        }
      } else {
        return 2;
      }
      //find deltaTime of currenttime and statusRes time., If time is too big: problem to reparse
      let currenttime = new Date().toUTCString();
      let servertime = statusRes.data.current;
      let utctimearray = currenttime.split(' ');
      let servertimearray = servertime.split('-');

      let currenttimearray = utctimearray[4].split(':');
      let difference =
        (currenttimearray[0] - servertimearray[0]) * 60 * 60 +
        (currenttimearray[1] - servertimearray[1]) * 60 +
        (currenttimearray[2] - servertimearray[2]);

      if (difference < 0) {
        difference += 24 * 60 * 60;
      }
      if (difference > 2 * 60) {
        return 2;
      }
      return 1;
    }
    return 3;
  };
  const setStack = async (item) => {
    if (!item.fileId && !item.fileUUId) {
      return;
    }

    try {
      let okToParse = 0;
      if (!item.fileStack || item.fileStack === null) {
        //console.log('Checking Store', item.fileStore);
        if (item.fileStore && item.fileStore.length > 0) {
          const fileStack =
            item.fileStore.slice(0, item.fileStore.length - 1) + 'S0';
          //console.log('Checking Stack', fileStack);
          const whichOneToLoad = getResourcePathURL(item) + fileStack;
          const whichOneToStatus = getStatusPathURL(item) + fileStack;
          okToParse = await checkStatusToParse(
            whichOneToLoad,
            whichOneToStatus
          );
          if (okToParse <= 1) {
            //console.log('Found', fileStack);
            item.fileStack = fileStack;
          } else {
            console.log('Stack Not Found', fileStack);
          }
        } else {
          console.log('Store Not Found', item.fileStore);
        }
      } else {
        const whichOneToLoad = getResourcePathURL(item) + item.fileStack;
        const whichOneToStatus = getStatusPathURL(item) + item.fileStack;
        okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
        if (okToParse > 1) {
          item.fileStack = null;
        }
      }
      if (!item.fileStack || item.fileStack === null) {
        //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
        setIsLoading(true);
        setIsFileLoading(true);
        getPartsStackableInfo(
          getStepFile(item),
          item.distanceGap ? item.distanceGap : STATEPROPS.distancegap,
          item.angleGap ? item.angleGap : STATEPROPS.anglegap,
          STATEPROPS.animationtime
        )
          .then((res) => res.data)
          .then((repos) => {
            //console.log(repos);
            //const multiAssembly = get(repos, 'tree', []).length > 0;
            const stack = repos['store'];
            item.fileStack = stack;
            setgltfjson({
              ...repos,
              kinematic: item.fileKinematic,
              mpps: item.fileMPPS,
              store: item.fileStore,
              stack: stack,
              gdt: item.fileGDT,
              //multiAssembly: multiAssembly,
              treeLength: repos['tree'].length,
              resourcepath: resourcePathURL
            });
            setItemProperties((prevData) => ({
              ...prevData,
              fileStack: stack
            }));
            setIsLoading(false);
            setIsFileLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
            setIsFileLoading(false);
            console.log('Error While Parsing', err);
          });
      } else {
        //console.log("Up1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
        fetchGLTFAndTree(
          'stack',
          item.fileStore,
          item.fileGDT,
          item.fileMPPS,
          item.fileStack,
          item.fileKinematic,
          item.fileUUId,
          okToParse
        );
        if (itemProperties.fileStack != item.fileStack) {
          setItemProperties((prevData) => ({
            ...prevData,
            fileStack: item.fileStack
          }));
        }
      }
    } catch (error) {
      setIsLoading(false);
      setIsFileLoading(false);
      console.log('Error in SetStack', error);
    }
  };

  const setOrder = async (item) => {
    if (!item.fileId && !item.fileUUId) {
      return;
    }

    try {
      let okToParse = 0;
      if (!item.fileMPPS || item.fileMPPS === null) {
        //console.log('Checking Store', item.fileStore);
        if (item.fileStore && item.fileStore.length > 0) {
          const fileMPPS =
            item.fileStore.slice(0, item.fileStore.length - 1) + 'M0';
          //console.log('Checking Order', fileMPPS);
          const whichOneToLoad = getResourcePathURL(item) + fileMPPS;
          const whichOneToStatus = getStatusPathURL(item) + fileMPPS;
          okToParse = await checkStatusToParse(
            whichOneToLoad,
            whichOneToStatus
          );
          if (okToParse <= 1) {
            //console.log('Found', fileMPPS);
            item.fileMPPS = fileMPPS;
          } else {
            console.log('Order Not Found', fileMPPS);
          }
        } else {
          console.log('Store Not Found', item.fileStore);
        }
      } else {
        const whichOneToLoad = getResourcePathURL(item) + item.fileMPPS;
        const whichOneToStatus = getStatusPathURL(item) + item.fileMPPS;
        okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
        if (okToParse > 1) {
          item.fileMPPS = null;
        }
      }
      //console.log('Ok to Parse', okToParse, 'File MPPS', item.fileMPPS);
      if (!item.fileMPPS || item.fileMPPS === null) {
        //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
        //console.log('Setting here', okToParse);
        setIsLoading(true);
        setIsFileLoading(true);
        setProgressBarLoad(true);
        let percent = 0;
        const getHierarchyRes = await getPartsAssemblyOrder(
          getStepFile(item),
          item.distanceGap ? item.distanceGap : STATEPROPS.distancegap,
          item.angleGap ? item.angleGap : STATEPROPS.anglegap,
          STATEPROPS.explodegap,
          STATEPROPS.fromcenter,
          STATEPROPS.holescale,
          STATEPROPS.removegap,
          STATEPROPS.animationtime
        );
        setIsFileLoading(false);
        let datastore = getHierarchyRes.data.store;
        let dataload = getHierarchyRes.data.load;
        const datastatus = getHierarchyRes.data.status;
        if (datastatus) {
          percent = datastatus.percent;
        }
        setPercentage(percent);
        if ((!datastore || percent != 100) && item.fileUUId) {
          if (!datastore) {
            setIsLoading(false);
            setIsFileLoading(false);
          } else {
            const datafile = item.fileUUId + '/' + datastore;
            let fetchStatus = () => getAFileFromStore(datafile, 'status');
            let validateStatus = (result) => {
              //console.log(result.data,result.data.percent,result.data.percent!=100);
              return result.data.percent != 100;
            };
            let percentFunction = (result) =>
              result.data.percent ? result.data.percent : percentage;
            await pollFunction(
              fetchStatus,
              validateStatus,
              20000,
              setPercentage,
              percentFunction,
              setCurrentProgressText,
              setCompletionProgressText
            );
            const gltfRes = await getAFileFromStore(datafile, 'gltf');
            const treeRes = await getAFileFromStore(datafile, 'tree');
            const orderRes = await getAFileFromStore(datafile, 'order');

            //const multiAssembly = treeRes.length > 0;
            const mpps = gltfRes.data['store'];
            item.fileMPPS = mpps;
            setgltfjson({
              gltf: gltfRes.data,
              tree: treeRes.data,
              assemblyorder: orderRes.data,
              //multiAssembly: multiAssembly,
              treeLength: treeRes.data.length,
              kinematic: item.fileKinematic,
              mpps: mpps,
              store: item.fileStore,
              stack: item.fileStack,
              gdt: item.fileGDT,
              resourcepath: resourcePathURL
            });

            setItemProperties((prevData) => ({
              ...prevData,
              fileMPPS: mpps
            }));
            setIsLoading(false);
            setIsFileLoading(false);
            //console.log('Done');
          }
        } else {
          if (!datastore) {
            setIsLoading(false);
            setIsFileLoading(false);
          }
          setgltfjson({
            ...getHierarchyRes.data,
            kinematic: item.fileKinematic,
            mpps: item.fileMPPS,
            store: item.fileStore,
            stack: item.fileStack,
            gdt: item.fileGDT,
            resourcepath: resourcePathURL
          });
          setIsLoading(false);
          setIsFileLoading(false);
        }
        setProgressBarLoad(false);
      } else {
        //console.log("Up1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
        fetchGLTFAndTree(
          'mpps',
          item.fileStore,
          item.fileGDT,
          item.fileMPPS,
          item.fileStack,
          item.fileKinematic,
          item.fileUUId,
          okToParse
        );
        if (itemProperties.fileMPPS != item.fileMPPS) {
          setItemProperties((prevData) => ({
            ...prevData,
            fileMPPS: item.fileMPPS
          }));
        }
      }
    } catch (error) {
      setIsLoading(false);
      setIsFileLoading(false);
      setProgressBarLoad(false);
      console.log('Error in SetOrder', error);
    }
  };

  const handleProductDesignTab = async ({ item, myTabedIndex, myTabIndex }) => {
    let okToParse = 0;
    if (item.fileStore) {
      console.log('---------1');
      const whichOneToLoad = getResourcePathURL(item) + item.fileStore;
      const whichOneToStatus = getStatusPathURL(item) + item.fileStore;
      okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
    } else {
      okToParse = 2;
    }

    if (okToParse > 1 || !item.fileStore || item.fileStore === null) {
      console.log('---------2', item, STATEPROPS);
      setIsLoading(true);
      setIsFileLoading(true);
      setProgressBarLoad(true);
      let percent = 0;
      const getHierarchyRes = await getHierarchySplitFiles(
        getStepFile(item),
        true,
        item.distanceGap ? item.distanceGap : STATEPROPS.distancegap,
        item.angleGap ? item.angleGap : STATEPROPS.anglegap,
        STATEPROPS.disect,
        0,
        0,
        0,
        STATEPROPS.maximumfaces,
        //item.stepTreeLength > STATEPROPS.maximumparts,
        true,
        myTabedIndex == 'pdcu',
        allowFirstLevelItems,
        createAutoAssemblyOrder,
        createAutoStackability,
        STATEPROPS.explodegap,
        STATEPROPS.holescale,
        STATEPROPS.removegap,
        STATEPROPS.fromcenter,
        STATEPROPS.animationtime
      );

      setIsFileLoading(false);
      let datastore = getHierarchyRes.data.store;
      let dataload = getHierarchyRes.data.load;
      const datastatus = getHierarchyRes.data.status;

      if (datastatus) {
        percent = datastatus.percent;
      }
      setPercentage(percent);
      if ((!datastore || percent != 100) && item.fileUUId) {
        if (!datastore) {
          setIsLoading(false);
          setIsFileLoading(false);
        } else {
          const datafile = item.fileUUId + '/' + datastore;
          let fetchStatus = () => getAFileFromStore(datafile, 'status');
          let validateStatus = (result) => {
            //console.log(result.data,result.data.percent,result.data.percent!=100);
            return result.data.percent != 100;
          };
          let percentFunction = (result) =>
            result.data.percent ? result.data.percent : percentage;
          const statusRes = await pollFunction(
            fetchStatus,
            validateStatus,
            20000,
            setPercentage,
            percentFunction,
            setCurrentProgressText,
            setCompletionProgressText
          );
          const gltfRes = await getAFileFromStore(datafile, 'gltf');
          const treeRes = await getAFileFromStore(datafile, 'tree');
          const multiAssembly = statusRes
            ? statusRes.data
              ? statusRes.data.assemblies > 1
              : false
            : false;
          setgltfjson({
            gltf: gltfRes.data,
            tree: treeRes.data,
            multiAssembly: multiAssembly,
            kinematic: item.fileKinematic,
            mpps: item.fileMPPS,
            stack: item.fileStack,
            gdt: item.fileGDT,
            treeLength: treeRes.data.length,
            resourcepath: resourcePathURL
          });
          setItemProperties((prevData) => ({
            ...prevData,
            fileStore: datastore,
            multiAssembly: multiAssembly,
            stepTreeLength: treeRes.data.length
          }));
        }
      } else {
        if (!datastore) {
          setIsLoading(false);
          setIsLoading(false);
        } else {
          const treeLength = get(getHierarchyRes.data, 'tree', []).length;
          const multiAssembly = getHierarchyRes
            ? getHierarchyRes.data
              ? getHierarchyRes.data.status
                ? getHierarchyRes.data.status.assemblies > 1
                : false
              : false
            : false;
          //const multiAssembly = treeLength > 0;
          setgltfjson({
            ...getHierarchyRes.data,
            multiAssembly: multiAssembly,
            kinematic: item.fileKinematic,
            mpps: item.fileMPPS,
            stack: item.fileStack,
            gdt: item.fileGDT,
            treeLength: treeLength,
            resourcepath: resourcePathURL
          });
          setItemProperties((prevData) => ({
            ...prevData,
            fileStore: datastore,
            multiAssembly: multiAssembly,
            stepTreeLength: treeLength
          }));
        }
      }
      setProgressBarLoad(false);
    } else {
      console.log('---------3');
      fetchGLTFAndTree(
        myTabIndex,
        item.fileStore,
        item.fileGDT,
        item.fileMPPS,
        item.fileStack,
        item.fileKinematic,
        item.fileUUId,
        okToParse
      );
      if (itemProperties.fileStore != item.fileStore) {
        setItemProperties((prevData) => ({
          ...prevData,
          fileStore: item.fileStore
        }));
      }
    }
  };

  const handleInternalUseProduct = async ({
    item,
    myTabedIndex,
    myTabIndex
  }) => {
    // console.log('Checking iupc', myTabIndex, item);
    let okToParse = 0;
    if (!item.fileKinematic || item.fileKinematic === null) {
      //console.log('Checking Store', item.fileStore);
      if (item.fileStore && item.fileStore.length > 0) {
        const fileKinematic =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'K0';
        //console.log('Checking Kinematic', fileKinematic);
        const whichOneToLoad = getResourcePathURL(item) + fileKinematic;
        const whichOneToStatus = getStatusPathURL(item) + fileKinematic;
        okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
        if (okToParse <= 1) {
          //console.log('Found', fileKinematic);
          item.fileKinematic = fileKinematic;
        } else {
          console.log('Kinematic Not Found', fileKinematic);
        }
      } else {
        console.log('Store Not Found', item.fileStore);
      }
    } else {
      const whichOneToLoad = getResourcePathURL(item) + item.fileKinematic;
      const whichOneToStatus = getStatusPathURL(item) + item.fileKinematic;
      okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
      if (okToParse > 1) {
        item.fileKinematic = null;
      }
    }
    if (!item.fileKinematic || item.fileKinematic === null) {
      setIsLoading(true);
      setIsFileLoading(true);
      getPartsKinematicOrder(
        getStepFile(item),
        item.distanceGap ? item.distanceGap : STATEPROPS.distancegap,
        item.angleGap ? item.angleGap : STATEPROPS.anglegap,
        STATEPROPS.animationtime
      )
        .then((res) => res.data)
        .then((repos) => {
          //const multiAssembly = get(repos, 'tree', []).length > 0;
          const kinematic = repos['store'];
          item.fileKinematic = kinematic;

          setgltfjson({
            ...repos,
            kinematic: kinematic,
            mpps: item.fileMPPS,
            store: item.fileStore,
            stack: item.fileStack,
            gdt: item.fileGDT,
            //multiAssembly: multiAssembly,
            treeLength: repos['tree'].length,
            resourcepath: resourcePathURL
          });
          setItemProperties((prevData) => ({
            ...prevData,
            fileKinematic: kinematic
          }));
          setIsLoading(false);
          setIsFileLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          setIsFileLoading(false);
        });
    } else {
      fetchGLTFAndTree(
        myTabIndex,
        item.fileStore,
        item.fileGDT,
        item.fileMPPS,
        item.fileStack,
        item.fileKinematic,
        item.fileUUId,
        okToParse
      );
      if (itemProperties.fileKinematic != item.fileKinematic) {
        setItemProperties((prevData) => ({
          ...prevData,
          fileKinematic: item.fileKinematic
        }));
      }
    }
  };

  const handleOtherTabCase = async ({ item, myTabedIndex, myTabIndex }) => {
    let okToParse = 0;
    if (!item.fileGDT || item.fileGDT === null) {
      if (item.fileStore && item.fileStore.length > 0) {
        const fileGDT =
          item.fileStore.slice(0, item.fileStore.length - 1) + '3';
        const whichOneToLoad = getResourcePathURL(item) + fileGDT;
        const whichOneToStatus = getStatusPathURL(item) + fileGDT;
        okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
        if (okToParse <= 1) {
          item.fileGDT = fileGDT;
        } else {
          console.log('GDT Not Found', fileGDT);
        }
      } else {
        console.log('Store Not Found', item.fileStore);
      }
    } else {
      const whichOneToLoad = getResourcePathURL(item) + item.fileGDT;
      const whichOneToStatus = getStatusPathURL(item) + item.fileGDT;
      okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
      if (okToParse > 1) {
        item.fileGDT = null;
      }
    }
    console.log('Hello world 2', item, STATEPROPS);
    if (!item.fileGDT || item.fileGDT === null) {
      setIsLoading(true);
      setIsFileLoading(true);
      setProgressBarLoad(true);
      let percent = 0;

      const getHierarchyRes = await getHierarchySplitFiles(
        getStepFile(item),
        true,
        item.distanceGap ? item.distanceGap : STATEPROPS.distancegap,
        item.angleGap ? item.angleGap : STATEPROPS.anglegap,
        STATEPROPS.disect,
        0,
        STATEPROPS.edgesize,
        STATEPROPS.vertexsize,
        STATEPROPS.maximumfaces,
        //item.stepTreeLength > STATEPROPS.maximumparts,
        true,
        myTabedIndex == 'pdcu',
        allowFirstLevelItems,
        createAutoAssemblyOrder,
        createAutoStackability,
        STATEPROPS.explodegap,
        STATEPROPS.holescale,
        STATEPROPS.removegap,
        STATEPROPS.fromcenter,
        STATEPROPS.animationtime
      );
      setIsFileLoading(false);
      let datastore = getHierarchyRes.data.store;
      let filenameWithOutExtension = datastore
        ? datastore.slice(0, datastore.length - 1)
        : '';
      let dataload = getHierarchyRes.data.load;
      const datastatus = getHierarchyRes.data.status;

      if (datastatus) {
        percent = datastatus.percent;
      }
      setPercentage(percent);
      if ((!datastore || percent != 100) && item.fileUUId) {
        if (!datastore) {
          setIsLoading(false);
          setIsFileLoading(false);
        } else {
          const datafile = item.fileUUId + '/' + datastore;
          let fetchStatus = () => getAFileFromStore(datafile, 'status');
          let validateStatus = (result) => {
            return result.data.percent != 100;
          };
          let percentFunction = (result) =>
            result.data.percent ? result.data.percent : percentage;
          const statusRes = await pollFunction(
            fetchStatus,
            validateStatus,
            20000,
            setPercentage,
            percentFunction,
            setCurrentProgressText,
            setCompletionProgressText
          );
          const gltfRes = await getAFileFromStore(datafile, 'gltf');
          const treeRes = await getAFileFromStore(datafile, 'tree');
          const multiAssembly = statusRes
            ? statusRes.data
              ? statusRes.data.assemblies > 1
              : false
            : false;
          const fileStore = filenameWithOutExtension + '0';
          setgltfjson({
            gltf: gltfRes.data,
            tree: treeRes.data,
            multiAssembly: multiAssembly,
            kinematic: item.fileKinematic,
            mpps: item.fileMPPS,
            stack: item.fileStack,
            gdt: datastore,
            store: fileStore,
            treeLength: treeRes.data.length,
            resourcepath: resourcePathURL
          });
          setItemProperties((prevData) => ({
            ...prevData,
            fileGDT: datastore,
            fileStore: fileStore,
            multiAssembly: multiAssembly,
            stepTreeLength: treeRes.data.length
          }));
        }
      } else {
        if (!datastore) {
          setIsLoading(false);
          setIsFileLoading(false);
        } else {
          const treeLength = get(getHierarchyRes.data, 'tree', []).length;
          const multiAssembly = getHierarchyRes
            ? getHierarchyRes.data
              ? getHierarchyRes.data.status
                ? getHierarchyRes.data.status.assemblies > 1
                : false
              : false
            : false;
          const fileStore = filenameWithOutExtension + '0';
          setgltfjson({
            ...getHierarchyRes.data,
            multiAssembly: multiAssembly,
            kinematic: item.fileKinematic,
            mpps: item.fileMPPS,
            stack: item.fileStack,
            gdt: datastore,
            store: fileStore,
            treeLength: treeLength,
            resourcepath: resourcePathURL
          });
          setItemProperties((prevData) => ({
            ...prevData,
            fileGDT: datastore,
            fileStore: fileStore,
            multiAssembly: multiAssembly,
            stepTreeLength: treeLength
          }));
        }
      }
      if (allowFirstLevelItems && datastore) {
        createChildItems({
          pathFileName: filenameWithOutExtension,
          fileUUId: item.fileUUId,
          parentId: item.id
        });
      }
      setProgressBarLoad(false);
      setIsLoading(false);
      setIsFileLoading(false);
    } else {
      fetchGLTFAndTree(
        myTabIndex,
        item.fileStore,
        item.fileGDT,
        item.fileMPPS,
        item.fileStack,
        item.fileKinematic,
        item.fileUUId,
        okToParse
      );
      if (itemProperties.fileGDT != item.fileGDT) {
        setItemProperties((prevData) => ({
          ...prevData,
          fileGDT: item.fileGDT
        }));
      }
    }
    handleSave();
  };

  const setGLTFAndTree = async (item, myTabedIndex) => {
    if (myTabedIndex == tabIndex) {
      if (
        (!item.fileId && !item.fileUUId) ||
        !parserNeeded.includes(myTabedIndex)
      ) {
        setIsLoading(false);
        return;
      }

      try {
        let myTabIndex =
          myTabedIndex == 'iupc' || myTabedIndex == 'pdcu'
            ? 'gdtac'
            : myTabedIndex;
        if (myTabIndex == 'iupc') {
          handleInternalUseProduct({ item, myTabedIndex, myTabIndex });
        } else if (myTabIndex == 'pdcu') {
          await handleProductDesignTab({ item, myTabedIndex, myTabIndex });
        } else {
          await handleOtherTabCase({ item, myTabedIndex, myTabIndex });
        }
      } catch (error) {
        setIsLoading(false);
        setIsFileLoading(false);
      }
    } else {
    }
  };
  const handleCopyId = (event) => {
    navigator.clipboard.writeText(id);
    event.stopPropagation();
  };

  const fetchGLTFAndTree = async (
    myTabedIndex,
    fileStore,
    fileGDT,
    fileMPPS,
    fileStack,
    fileKinematic,
    fileUUId,
    okToParse
  ) => {
    try {
      let obj = {
        gltf: {},
        tree: {},
        store: fileStore,
        gdt: fileGDT,
        mpps: fileMPPS,
        stack: fileStack,
        kinematic: fileKinematic
      };
      setIsLoading(true);
      let myTabIndex =
        myTabedIndex == 'iupc' || myTabedIndex == 'pdcu'
          ? 'gdtac'
          : myTabedIndex;
      let whichOneToLoad = fileUUId ? fileUUId + '/' : '';
      if (myTabIndex == 'pdcu') {
        whichOneToLoad += fileStore;
      } else if (myTabIndex == 'mpps') {
        whichOneToLoad += fileMPPS;
      } else if (myTabIndex == 'stack') {
        whichOneToLoad += fileStack;
      } else if (myTabIndex == 'iupc') {
        whichOneToLoad += fileKinematic;
      } else {
        whichOneToLoad += fileGDT;
      }
      setProgressBarLoad(true);
      if (fileUUId && okToParse == 1) {
        const statusRes = await getAFileFromStore(whichOneToLoad, 'status');
        let percent = 0;
        if (
          statusRes &&
          statusRes.data &&
          !isEmptyObjectDictionary(statusRes.data)
        ) {
          percent = statusRes.data.percent;
        }
        setPercentage(percent);
        if (percent != 100) {
          const datafile = whichOneToLoad;
          let fetchStatus = () => getAFileFromStore(datafile, 'status');
          let validateStatus = (result) => {
            return result.data.percent != 100;
          };
          let percentFunction = (result) =>
            result.data.percent ? result.data.percent : percentage;
          await pollFunction(
            fetchStatus,
            validateStatus,
            20000,
            setPercentage,
            percentFunction,
            setCurrentProgressText,
            setCompletionProgressText
          );
        }
      }
      // console.log('Fetching files, ', whichOneToLoad);
      //
      const myResourcePath = await checkExistingPathFromStore(
        whichOneToLoad,
        'gltf'
      );
      //
      const gltfRes = await getAFileFromURLStore(
        whichOneToLoad,
        'gltf',
        myResourcePath
      );
      const treeRes = await getAFileFromURLStore(
        whichOneToLoad,
        'tree',
        myResourcePath
      );
      let stackRes = { data: null };
      let orderRes = { data: null };
      let gdtRes = { data: null };
      if (myTabIndex == 'stack') {
        stackRes = await getAFileFromURLStore(
          whichOneToLoad,
          'stack',
          myResourcePath
        );
      }
      if (myTabIndex == 'mpps') {
        orderRes = await getAFileFromURLStore(
          whichOneToLoad,
          'order',
          myResourcePath
        );
      }
      if (myTabIndex == 'gdtac') {
        gdtRes = await getAFileFromURLStore(
          whichOneToLoad,
          'gdt',
          myResourcePath
        );
      }
      //const multiAssembly = treeRes.length > 0;

      setgltfjson({
        ...obj,
        gltf: gltfRes.data,
        tree: treeRes.data,
        stackable: stackRes.data,
        assemblyorder: orderRes.data,
        //multiAssembly: multiAssembly,
        gdttable: gdtRes.data,
        treeLength: treeRes.data.length,
        resourcepath: myResourcePath
      });
      setIsLoading(false);
      setProgressBarLoad(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const additionalSaveFunction = (saveFunction) => {
    state_additionalSaveFunction = saveFunction;
  };
  const renderPageSwitch = () => {
    if (!get(itemProperties, 'id') && !id) {
      return null;
    }
    if (tabIndex != 'gdtac' && tabIndex != 'iupc' && tabIndex != 'mpps') {
      additionalSaveFunction(null);
    }
    switch (tabIndex) {
      case 0:
        return 'Add vendor items here';
      case 'cf':
        return <Classification handleItemUpdateLocallay={handleItemUpdate} />;
      case 'pdcu':
        return (
          <BaseItemProperties
            itemId={id}
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
            gltfjson={gltfjson}
            setgltfjson={setgltfjson}
            tabIndex={tabIndex}
            setTabIndex={setTabIndex}
            handleItemUpdateLocallay={handleItemUpdate}
            handleItemSaveOnServer={handleSave}
            progressBarLoad={progressBarLoad}
            percentage={percentage}
            currentProgressText={currentProgressText}
            completionProgressText={completionProgressText}
            centerActionText={centerActionText}
            //setProgressBarRender={setProgressBarRender}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            drawLine={
              /* checkDBNull(itemProperties.drawLine)
                ? true
                : */ itemProperties.drawLine
            }
            distanceGap={
              /* checkDBNull(itemProperties.drawLine)
                ? STATEPROPS.distancegap
                :  */ itemProperties.distanceGap
            }
            angleGap={
              /* checkDBNull(itemProperties.drawLine)
                ? STATEPROPS.anglegap
                : */ itemProperties.angleGap
            }
            allowFirstLevelItems={allowFirstLevelItems}
            setAllowFirstLevelItems={setAllowFirstLevelItems}
            createAutoAssemblyOrder={createAutoAssemblyOrder}
            setCreateAutoAssemblyOrder={setCreateAutoAssemblyOrder}
            createAutoStackability={createAutoStackability}
            setCreateAutoStackability={setCreateAutoStackability}
          />
        );
      case 'cu':
        return <CurrentUsage itemId={id} />;
      case 'gdtac':
        return (
          <GeometricDimensioning
            fileId={itemProperties.fileId}
            fileGDT={itemProperties.fileGDT}
            fileUUId={itemProperties.fileUUId}
            gltfjson={gltfjson}
            isLoading={isLoading}
            //assemblyTree={get(gltfjson, 'tree', [])}
            tabIndex={tabIndex}
            keyName={{ name: '', option: SELECTFEATURE }}
            handleChangeOfSelection={null}
            additionalSaveFunction={additionalSaveFunction}
            progressBarLoad={progressBarLoad}
            percentage={percentage}
            currentProgressText={currentProgressText}
            completionProgressText={completionProgressText}
            centerActionText={centerActionText}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            //setProgressBarRender={setProgressBarRender}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            drawLine={
              /* checkDBNull(itemProperties.drawLine)
                ? true
                :  */ itemProperties.drawLine
            }
            {...{ internalProductConfig }}
          />
        );
      case 'iupc':
        return (
          <ItemTypeConfigurations
            itemId={id}
            fileId={itemProperties.fileId}
            fileUUId={itemProperties.fileUUId}
            fileGDT={itemProperties.fileGDT}
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
            gltfjson={gltfjson}
            setgltfjson={setgltfjson}
            isLoading={isLoading}
            handleItemUpdate={handleItemUpdate}
            tabIndex={tabIndex}
            additionalSaveFunction={additionalSaveFunction}
            progressBarLoad={progressBarLoad}
            percentage={percentage}
            currentProgressText={currentProgressText}
            completionProgressText={completionProgressText}
            centerActionText={centerActionText}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            //setProgressBarRender={setProgressBarRender}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            internalProductConfig={internalProductConfig}
            drawLine={
              /* checkDBNull(itemProperties.drawLine)
                ? true
                : */ itemProperties.drawLine
            }
          />
        );
      case 5:
        return <VendorDetails />;
      case 'mpps':
        return (
          <ManufactureProcessingProcessSimulation
            itemId={id}
            fileId={itemProperties.fileId}
            fileUUId={itemProperties.fileUUId}
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
            fetchList={ItemAPI.getItemsAPI}
            setStack={setStack}
            setOrder={setOrder}
            gltfjson={gltfjson}
            isLoading={isLoading}
            additionalSaveFunction={additionalSaveFunction}
            progressBarLoad={progressBarLoad}
            percentage={percentage}
            currentProgressText={currentProgressText}
            completionProgressText={completionProgressText}
            centerActionText={centerActionText}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            //setProgressBarRender={setProgressBarRender}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            drawLine={
              /* checkDBNull(itemProperties.drawLine)
                ? true
                :  */ itemProperties.drawLine
            }
          />
        );
      case 7:
        return (
          <ClientSetup
            itemProperties={itemProperties}
            setItemProperties={setItemProperties}
          />
        );
      case 'assembly':
        return <Assembly assemblyTree={get(gltfjson, 'tree', [])} />;
      case 'production':
        return <Production />;
      case 'sft':
        return <SurfaceFinishAndTreatment />;
      case 'cc':
        return (
          <ComplianceAndCertifications
            itemValue={itemProperties}
            setItemValue={setItemProperties}
          />
        );
      case 'fls':
        return 'Functional Load and Simulation';
      case 'dm':
        return 'Design Modifications';
      case 'slfpi':
        return 'Software Loading for PCBs, ICs';
      case 'pv':
        return 'Production Validations';
      case 'ps':
        return 'Process Sharing';
      case 'wmm':
        return 'Warranty & Maintenance Management';
      case 'pd':
        return 'Product Documentation';
      case 'rs':
        return 'Recycling & Sustainability';
      case 'pds':
        return <ProductDesignSetup {...{ itemId: id, gltfjson }} />;
      default:
        return 'Undefined Tab Index';
    }
  };

  const handleItemUpdate = (change) => {
    let tempItemProperties = Object.assign({}, itemProperties, change);
    console.log(
      'Changing itemproperties in hanldeitemupdate',
      tempItemProperties
    );
    setItemProperties(tempItemProperties);
  };

  const handleSave = (change) => {
    itemProperties.step = undefined;
    itemProperties.gltfjson = undefined;
    itemProperties.itemId = undefined;
    console.log(
      'Changing item properties from handle save before assiging',
      itemProperties
    );
    let updateItemProperties = Object.assign({}, itemProperties, change);
    console.log(
      'Changing item properties from handle save after assiging',
      updateItemProperties
    );
    ItemAPI.updateItemAPI(id, { ...updateItemProperties })
      .then((res) => {
        if (res && res.data) {
          console.log(
            'Changing item properties from handle save after UpdateItemAPI',
            res.data
          );
          setItemProperties(res.data);
          dispatch(showSuccessAlert({ message: 'Item Updated' }));
        } else {
          dispatch(showErrorAlert({ message: 'Unable to save info' }));
        }
      })
      .catch((error) => {
        dispatch(showErrorAlert({ message: 'Unable to save info' }));
      });
    try {
      if (state_additionalSaveFunction) {
        state_additionalSaveFunction();
      }
    } catch (error) {
      console.log('Error while saving', error);
    }
  };

  const handleTabChange = (event, newTabIndex) => {
    if (tabIndex !== newTabIndex) {
      console.log(tabIndex, newTabIndex);
      setIsLoading(true);
      setTabIndex(newTabIndex);
      history.push({
        pathname: `/items/${id}`,
        search: `?tab=${newTabIndex}`
      });

      handleSave();
    }
  };

  const tabList = {
    pdcu: 'Product Design or CAD Upload',
    cf: 'Classification',
    cc: 'Compliance and Certifications',
    gdtac: 'GD&T and Assembly Constraints',
    sft: 'Surface Finish and Treatment',
    fls: 'Functional Load and Simulation',
    dm: 'Design Modifications',
    slfpi: 'Software Loading for PCBs, ICs',
    cu: 'Current Usage',
    mpps: 'Manufacture, Processing, & Process Simulation',
    pv: 'Production Validations',
    ps: 'Process Sharing',
    wmm: 'Warranty & Maintenance Management',
    pd: 'Product Documentation',
    rs: 'Recycling & Sustainability',
    pds: 'Product Design Setup',
    iupc: 'Internal Use Product Configurations',
    production: 'Production'
  };

  const renderTab = () => {
    let tabP = [];
    Object.keys(tabList).forEach((key, index) => {
      tabP.push(
        <Tab
          label={`${index + 1}. ${tabList[key]}`}
          value={key}
          key={key}
          style={{ textAlign: 'left', minHeight: '30px' }}
        />
      );
    });
    return tabP;
  };

  return (
    <>
      {<LoadingModal isLoading={isFileLoading} />}
      <Grid container>
        <Grid item sm={12}>
          <SubHeaderWithArrow action={'/items'} title={'Items Details'} />
          <DetailComponentInnerHeader
            {...{
              name: itemProperties.name,
              id: itemProperties.id,
              handleSave,
              tabName: tabList[tabIndex]
            }}
          />
        </Grid>
      </Grid>
      <Grid container style={{ flexWrap: 'unset' }}>
        <TabContainer>
          <Tabs
            className="MuiTab-wrapper"
            orientation="vertical"
            variant="scrollable"
            value={tabIndex}
            onChange={handleTabChange}
          >
            {renderTab()}
          </Tabs>
        </TabContainer>
        <TabPanelContainer>{renderPageSwitch()}</TabPanelContainer>
      </Grid>
      <Snackbar
        style={{
          left: '10%'
        }}
        open={true}
      >
        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={() => handleSave()}
        >
          Save
        </Button>
      </Snackbar>
    </>
  );
};

export default ItemDetail;

const DetailComponentInnerHeader = ({ name, id, handleSave, tabName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      style={{
        padding: 10,
        margin: 10,
        display: 'flex',
        position: 'relative',
        flexDirection: 'column'
      }}
    >
      <Box style={{ zIndex: 999 }}>
        <EditItemTitle
          {...{
            name,
            updateItemOnServer: handleSave
          }}
        />
        {console.log('--->>naame', name)}
      </Box>
      <Headding as={'h5'}>
        Item ID:{id} <ClipboardText item_id={id} />
      </Headding>
      <Headding
        as={'h4'}
        style={{
          position: isMobile ? 'relative' : 'absolute',
          display: 'flex',

          justifyContent: 'center',
          width: '100%',
          alignItems: 'center',
          height: '100%'
        }}
      >
        {tabName}
      </Headding>
    </Paper>
  );
};
