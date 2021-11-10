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
import AddBoxIcon from '@material-ui/icons/AddBox';
import EditIcon from '@material-ui/icons/Edit';
import SubHeaderWithArrow from '../../components/SubHeaderWithArrow';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import BaseItemProperties from './baseItemProperties';
import GeometricDimensioning from './geometricDimensioning';
import CurrentUsage from './currentUsage';
import VendorDetails from './VendorDetails';
import ManufactureProcessingProcessSimulation from '@monostruct/common/containers/ManufactureProcessingProcessSimulation';
import ClientSetup from './clientSetup';
import Assembly from './assembly';
import Production from './production';
import SurfaceFinishAndTreatment from './SurfaceFinishAndTreatment';
import ComplianceAndCertifications from './ComplianceAndCertifications';

import ItemTypeConfigurations from '../itemTypeConfigurations';
import ItemAPI from '@monostruct/common/api/items.api';

import {
  SELECTFEATURE,
  STATEPROPS,
  pollFunction,
  isFileExistingInServer,
  checkDBNull
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
  getGltfForStore,
  getTreeForStore,
  resourcePathURL
} from '@monostruct/common/api/fileUpload.api';
import LoadingModal from '@monostruct/common/components/LoadingModal';

import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import Classification from '../classification';
// import { reducer, initialState } from './ItemDetail.helper';

let state_additionalSaveFunction = null;
const ItemDetail = () => {
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
  const [centerActionText,setCenterActionText]=useState(null);
  const [progressBarLoad, setProgressBarLoad] = useState(false);
  const [internalProductConfig, setInternalProductConfig] = useState(null);

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
        //setIsLoading(true);
        const itemDetailResponse = await ItemAPI.getItemsAPI(`id=${id}`);

        const _currentItem = get(itemDetailResponse, 'data[0]', {});

        dispatch(setCurrentItemAction(_currentItem));
        //console.log('I am doing the conversion inner', _currentItem);
        setGLTFAndTree({ ..._currentItem }, myTabIndex);

        setIsLoading(false);
      })();
    } else {
      //console.log('I am doing the conversion outer', itemProperties);
      setGLTFAndTree({ ...itemProperties }, myTabIndex);
    }
  }, [tabIndex]);

  useEffect(() => {
    if (currentItem) {
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
    if (isFileExistingInServer(whichOneToLoad + '.gltf')) {
      //console.log('Found gltf', whichOneToLoad);
      return 0;
    }
    if (isFileExistingInServer(whichOneToLoad + '.status')) {
      //console.log('Found status', whichOneToLoad);
      const statusRes = await getAFileFromStore(whichOneToStatus, 'status');
      let percent = 0;
      if (statusRes) {
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
      console.log(
        'What is got from Status file',
        currenttime,
        utctimearray,
        servertime,
        servertimearray
      );
      let currenttimearray = utctimearray[4].split(':');
      let difference =
        (currenttimearray[0] - servertimearray[0]) * 60 * 60 +
        (currenttimearray[1] - servertimearray[1]) * 60 +
        (currenttimearray[2] - servertimearray[2]);
      console.log(
        'What is got from Status file',
        currenttime,
        servertime,
        currenttimearray,
        utctimearray,
        servertimearray,
        difference
      );
      if (difference < 0) {
        difference += 24 * 60 * 60;
      }
      if (difference > 2 * 60) {
        return 2;
      }
      return 1;
    }
    console.log('NO gltf and status files Existing', whichOneToLoad);
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
        if(okToParse>1) {
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
            const multiAssmebly = get(repos, 'tree', []).length > 0;
            const stack = repos['store'];
            item.fileStack = stack;
            setgltfjson({
              ...repos,
              kinematic: item.fileKinematic,
              mpps: item.fileMPPS,
              store: item.fileStore,
              stack: stack,
              gdt: item.fileGDT,
              multiAssmebly: multiAssmebly,
              treeLength: repos['tree'].length
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
          if (okToParse<=1) {
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
        if(okToParse>1) {
          item.fileMPPS = null;
        }
      }
      if (!item.fileMPPS || item.fileMPPS === null) {
        //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
        setIsLoading(true);
        setIsFileLoading(true);
        console.log('Setting here');
        getPartsAssemblyOrder(
          getStepFile(item),
          item.distanceGap ? item.distanceGap : STATEPROPS.distancegap,
          item.angleGap ? item.angleGap : STATEPROPS.anglegap,
          STATEPROPS.explodegap,
          STATEPROPS.fromcenter,
          STATEPROPS.holescale,
          STATEPROPS.removegap,
          STATEPROPS.animationtime
        )
          .then((res) => res.data)
          .then((repos) => {
            console.log('Coming Here');
            const multiAssmebly = get(repos, 'tree', []).length > 0;
            const mpps = repos['store'];
            item.fileMPPS = mpps;
            setgltfjson({
              ...repos,
              kinematic: item.fileKinematic,
              mpps: mpps,
              store: item.fileStore,
              stack: item.fileStack,
              gdt: item.fileGDT,
              multiAssmebly: multiAssmebly,
              treeLength: repos['tree'].length
            });
            setItemProperties((prevData) => ({
              ...prevData,
              fileMPPS: mpps
            }));
            setIsLoading(false);
            setIsFileLoading(false);
            //console.log('Done');
          })
          .catch((err) => {
            setIsLoading(false);
            console.log('Error While Parsing', err);
          });
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
      console.log('Error in SetOrder', error);
    }
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
        let myTabIndex = ((myTabedIndex == 'iupc')||(myTabedIndex=='pdcu')) ? 'gdtac' : myTabedIndex;
        if (myTabIndex == 'iupc') {
          //console.log('Checking iupc', myTabIndex, item);
          let okToParse = 0;
          if (!item.fileKinematic || item.fileKinematic === null) {
            //console.log('Checking Store', item.fileStore);
            if (item.fileStore && item.fileStore.length > 0) {
              const fileKinematic =
                item.fileStore.slice(0, item.fileStore.length - 1) + 'K0';
              //console.log('Checking Kinematic', fileKinematic);
              const whichOneToLoad = getResourcePathURL(item) + fileKinematic;
              const whichOneToStatus = getStatusPathURL(item) + fileKinematic;
              okToParse = await checkStatusToParse(
                whichOneToLoad,
                whichOneToStatus
              );
              if (okToParse<=1) {
                //console.log('Found', fileKinematic);
                item.fileKinematic = fileKinematic;
              } else {
                console.log('Kinematic Not Found', fileKinematic);
              }
            } else {
              console.log('Store Not Found', item.fileStore);
            }
          } else {
            const whichOneToLoad =
              getResourcePathURL(item) + item.fileKinematic;
            const whichOneToStatus =
              getStatusPathURL(item) + item.fileKinematic;
            okToParse = await checkStatusToParse(
              whichOneToLoad,
              whichOneToStatus
            );
            if(okToParse>1) {
              item.fileKinematic = null;
            }
          }
          if (!item.fileKinematic || item.fileKinematic === null) {
            console.log(
              'Up0',
              myTabIndex,
              tabIndex,
              item.fileStore,
              item.fileKinematic,
              item.fileId
            );
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
                const multiAssmebly = get(repos, 'tree', []).length > 0;
                const kinematic = repos['store'];
                item.fileKinematic = kinematic;
                setgltfjson({
                  ...repos,
                  kinematic: kinematic,
                  mpps: item.fileMPPS,
                  store: item.fileStore,
                  stack: item.fileStack,
                  gdt: item.fileGDT,
                  multiAssmebly: multiAssmebly,
                  treeLength: repos['tree'].length
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
                console.log('Error While Parsing', err);
              });
          } else {
            //console.log("Up1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
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
        } else if (myTabIndex == 'pdcu') {
          let okToParse = 0;
          if (item.fileStore) {
            const whichOneToLoad = getResourcePathURL(item) + item.fileStore;
            const whichOneToStatus = getStatusPathURL(item) + item.fileStore;
            okToParse = await checkStatusToParse(
              whichOneToLoad,
              whichOneToStatus
            );
            console.log(
              'Go ahead status in calling api from beginning',
              okToParse
            );
          } else {
            okToParse = 2;
          }
          //console.log("After checking GLTF and Status",okToParse,item.fileStore,(okToParse || !item.fileStore || item.fileStore === null));
          if (okToParse > 1 || !item.fileStore || item.fileStore === null) {
            //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
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
              myTabedIndex=='pdcu'
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
                console.log('Error While Parsing', item);
              } else {
                const datafile = item.fileUUId + '/' + datastore;
                let fetchStatus = () => getAFileFromStore(datafile, 'status');
                let validateStatus = (result) => {
                  //console.log(result.data,result.data.percent,result.data.percent!=100);
                  return result.data.percent != 100;
                };
                let percentFunction = (result) =>
                  result.data.percent ? result.data.percent : percentage;
                console.log('Entering poll', datastore, dataload);
                await pollFunction(
                  fetchStatus,
                  validateStatus,
                  20000,
                  setPercentage,
                  percentFunction,
                  setCurrentProgressText,
                  setCompletionProgressText
                );
                console.log('Completing poll', datastore, dataload);
                const gltfRes = await getAFileFromStore(datafile, 'gltf');
                const treeRes = await getAFileFromStore(datafile, 'tree');
                const multiAssmebly = get(treeRes.data, 'tree', []).length > 0;
                setgltfjson({
                  gltf: gltfRes.data,
                  tree: treeRes.data,
                  multiAssmebly: multiAssmebly,
                  kinematic: item.fileKinematic,
                  mpps: item.fileMPPS,
                  stack: item.fileStack,
                  gdt: item.fileGDT,
                  treeLength: treeRes.data.length
                });
                setItemProperties((prevData) => ({
                  ...prevData,
                  fileStore: datastore
                }));
              }
            } else {
              if (!datastore) {
                setIsLoading(false);
                setIsLoading(false);
                console.log('Error While Parsing', item);
              } else {
                const treeLength = get(getHierarchyRes.data, 'tree', []).length;
                const multiAssmebly = treeLength > 0;
                setgltfjson({
                  ...getHierarchyRes.data,
                  multiAssmebly: multiAssmebly,
                  kinematic: item.fileKinematic,
                  mpps: item.fileMPPS,
                  stack: item.fileStack,
                  gdt: item.fileGDT,
                  treeLength: treeLength
                });
                setItemProperties((prevData) => ({
                  ...prevData,
                  fileStore: datastore
                }));
              }
            }
            setProgressBarLoad(false);
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
            if (itemProperties.fileStore != item.fileStore) {
              setItemProperties((prevData) => ({
                ...prevData,
                fileStore: item.fileStore
              }));
            }
          }
        } else {
          let okToParse = 0;
          if (!item.fileGDT || item.fileGDT === null) {
            if (item.fileStore && item.fileStore.length > 0) {
              const fileGDT =
                item.fileStore.slice(0, item.fileStore.length - 1) + '3';
              const whichOneToLoad = getResourcePathURL(item) + fileGDT;
              const whichOneToStatus = getStatusPathURL(item) + fileGDT;
              okToParse = await checkStatusToParse(
                whichOneToLoad,
                whichOneToStatus
              );
              if (okToParse<=1) {
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
            okToParse = await checkStatusToParse(
              whichOneToLoad,
              whichOneToStatus
            );
            if(okToParse>1) {
              item.fileGDT = null;
            }
          }
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
              myTabedIndex=='pdcu'
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
                const multiAssmebly = treeRes.data.length > 0;
                setgltfjson({
                  gltf: gltfRes.data,
                  tree: treeRes.data,
                  multiAssmebly: multiAssmebly,
                  kinematic: item.fileKinematic,
                  mpps: item.fileMPPS,
                  stack: item.fileStack,
                  gdt: datastore,
                  store: item.fileStore,
                  treeLength: treeRes.data.length
                });
                setItemProperties((prevData) => ({
                  ...prevData,
                  fileGDT: datastore
                }));
              }
            } else {
              if (!datastore) {
                setIsLoading(false);
                setIsFileLoading(false);
              } else {
                const treeLength = get(getHierarchyRes.data, 'tree', []).length;
                const multiAssmebly = treeLength > 0;
                setgltfjson({
                  ...getHierarchyRes.data,
                  multiAssmebly: multiAssmebly,
                  kinematic: item.fileKinematic,
                  mpps: item.fileMPPS,
                  stack: item.fileStack,
                  gdt: datastore,
                  store: item.fileStore,
                  treeLength: treeLength
                });
                setItemProperties((prevData) => ({
                  ...prevData,
                  fileGDT: datastore
                }));
              }
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
      let myTabIndex = ((myTabedIndex == 'iupc')||(myTabedIndex=='pdcu')) ? 'gdtac' : myTabedIndex;
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
        if (statusRes) {
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
      //
      const gltfRes = await getGltfForStore(whichOneToLoad);
      const treeRes = await getTreeForStore(whichOneToLoad);
      let stackRes = { data: null };
      let orderRes = { data: null };
      let gdtRes = { data: null };
      if (myTabIndex == 'stack') {
        stackRes = await getAFileFromStore(whichOneToLoad, 'stack');
      }
      if (myTabIndex == 'mpps') {
        orderRes = await getAFileFromStore(whichOneToLoad, 'order');
      }
      if (myTabIndex == 'gdtac') {
        gdtRes = await getAFileFromStore(whichOneToLoad, 'gdt');
      }
      const multiAssmebly = treeRes.length > 0;

      setgltfjson({
        ...obj,
        gltf: gltfRes.data,
        tree: treeRes.data,
        stackable: stackRes.data,
        assemblyorder: orderRes.data,
        multiAssmebly: multiAssmebly,
        gdttable: gdtRes.data,
        treeLength: treeRes.data.length
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
    if (!get(itemProperties, 'id')) {
      return null;
    }
    if (tabIndex != 'gdtac' && tabIndex != 'iupc' && tabIndex != 'mpps') {
      additionalSaveFunction(null);
    }
    switch (tabIndex) {
      case 0:
        return 'Add vendor items here';
      case 'cf':
        return <Classification handleItemUpdateLocallay={handleItemUpdate}/>;
      case 'pdcu':
        console.log(itemProperties);
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
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            drawLine={checkDBNull(itemProperties.drawLine)?true:itemProperties.drawLine}
            distanceGap={checkDBNull(itemProperties.drawLine)? STATEPROPS.distancegap : itemProperties.distanceGap}
            angleGap={checkDBNull(itemProperties.drawLine)? STATEPROPS.anglegap: itemProperties.angleGap}
          />
        );
      case 'cu':
        return <CurrentUsage itemId={id} />;
      case 'gdtac':
        console.log(
          itemProperties,
          itemProperties.fileGDT,
          itemProperties.fileUUId
        );
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
            //setProgressBarRender={setProgressBarRender}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            drawLine={
              checkDBNull(itemProperties.drawLine)
                ? true
                : itemProperties.drawLine
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
            //setProgressBarRender={setProgressBarRender}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            internalProductConfig={internalProductConfig}
            drawLine={
              checkDBNull(itemProperties.drawLine)
                ? true
                : itemProperties.drawLine
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
            //setProgressBarRender={setProgressBarRender}
            setPercentage={setPercentage}
            setProgressBarLoad={setProgressBarLoad}
            setCurrentProgressText={setCurrentProgressText}
            setCompletionProgressText={setCompletionProgressText}
            setCenterActionText={setCenterActionText}
            drawLine={
              checkDBNull(itemProperties.drawLine)
                ? true
                : itemProperties.drawLine
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
        return 'Design Product Design';
      default:
        return 'Undefined Tab Index';
    }
  };

  const handleItemUpdate = (change) => {
    let tempItemProperties = Object.assign({}, itemProperties, change);
    setItemProperties(tempItemProperties);
  };

  const handleSave = (change) => {
    itemProperties.step = undefined;
    itemProperties.gltfjson = undefined;
    itemProperties.itemId = undefined;

    let updateItemProperties = Object.assign({}, itemProperties, change);
    ItemAPI.updateItemAPI(id, { ...updateItemProperties })
      .then((res) => {
        if (res && res.data) {
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
      setIsLoading(true);
      setTabIndex(newTabIndex);
      history.push({
        pathname: `/items/${id}`,
        search: `?tab=${newTabIndex}`
      });
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
          <Paper style={{ padding: 10, margin: 10, display: 'flex' }}>
            <Grid>
              <h4>Item Name: {itemProperties.name}</h4>
              <Grid style={{ display: 'flex' }}>
                <p>Item ID:{id} </p>
                {/* <ClipboardText handleCopyId={handleCopyId} /> */}
              </Grid>
            </Grid>
            <Grid style={{ margin: 'auto' }}>
              <h4>{tabList[tabIndex]}</h4>
            </Grid>

            <Grid style={{ marginLeft: 'auto' }}>
              <Button>
                <AddBoxIcon />
              </Button>
              <Button>
                <EditIcon />
              </Button>
            </Grid>
          </Paper>
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
