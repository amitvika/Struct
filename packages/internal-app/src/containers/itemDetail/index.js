import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Paper, Tab, Tabs, Grid, Box, LinearProgress } from '@material-ui/core';
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

import {SELECTFEATURE, STATEPROPS, pollFunction} from "@monostruct/common/gltf/Tree/utils";

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
  resourcePathURL,
} from '@monostruct/common/api/fileUpload.api';
import LoadingModal from '@monostruct/common/components/LoadingModal';

import TabContainer from '@monostruct/common/components/TabContainer';
import TabPanelContainer from '@monostruct/common/components/TabPanelContainer';

/*const DEFAULTDISTANCEGAP = 0.1;
const DEFAULTANGLEGAP = 0.5;
const DEFAULTEDGESIZE = 0.3;
const DEFAULTVERTEXSIZE = 0.5;
const DEFAULTEXPLODEGAP = 10;
const DEFAULTFROMCENTER = true;
const DEFAULTHOLESCALE = 0.77;
const DEFAULTREMOVEGAP = 8;
const DEFAULTANIMATIONTIME = 1.0;
const DEFAULTDISECT = false;
const DEFAULTSHOWDISECT = false;
const DEFAULTSHOWINFOONSELECT = false;
const DEFAULTMATERIALTYPE = [{ id: 1, name: 'Basic' }];
const DEFAULTMAXIMUMFACES = 50;

const stateprops = {
  distancegap: DEFAULTDISTANCEGAP,
  anglegap: DEFAULTANGLEGAP,
  explodegap: DEFAULTEXPLODEGAP,
  disect: DEFAULTDISECT,
  showdisect: DEFAULTSHOWDISECT,
  showinfoonselect: DEFAULTSHOWINFOONSELECT,
  materialtype: DEFAULTMATERIALTYPE,
  fromcenter: DEFAULTFROMCENTER,
  holescale: DEFAULTHOLESCALE,
  removegap: DEFAULTREMOVEGAP,
  animationtime: DEFAULTANIMATIONTIME,
  maximumfaces: DEFAULTMAXIMUMFACES,
  edgesize: DEFAULTEDGESIZE,
  vertexsize: DEFAULTVERTEXSIZE,
};
*/
let state_additionalSaveFunction = null;
const ItemDetail = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  let { id } = useParams();
  let query = useQuery();

  const currentItem = useSelector((state) => state.item.currentItem);
  const [tabIndex, setTabIndex] = useState('pdcu');
  const [itemProperties, setItemProperties] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [gltfjson, setgltfjson] = useState({});
  const parserNeeded = ['pdcu', 'gdtac', 'iupc', 'assembly'];
  const [percentage, setPercentage] = useState(0);
  const [progressBarLoad, setProgressBarLoad] = useState(false);

  useEffect(() => {
    let myTabIndex = 'pdcu';
    if (query.get('tab')) {
      myTabIndex = query.get('tab');
      setTabIndex(myTabIndex);
    }

    const toFetchItem = !itemProperties || (!itemProperties.fileId && !itemProperties.fileUUId);
    if (toFetchItem) {
      (async () => {
        //setIsLoading(true);
        const itemDetailResponse = await ItemAPI.getItemsAPI(`id=${id}`);

        const _currentItem = get(itemDetailResponse, 'data[0]', {});

        dispatch(setCurrentItemAction(_currentItem));
        console.log("I am doing the conversion inner",_currentItem);
        setGLTFAndTree(_currentItem, myTabIndex);

        setIsLoading(false);
      })();
    } else {
      console.log("I am doing the conversion outer",itemProperties);
      setGLTFAndTree(itemProperties, myTabIndex);
    }
  }, [tabIndex]);

  useEffect(() => {
    if (currentItem) {
      setItemProperties(currentItem);
    }
  }, [currentItem]);

  const doesFileExist = (urlAsFile) => {
    var xhr = new XMLHttpRequest();
    try {
      xhr.open('HEAD', urlAsFile, false);
      xhr.send();

      return xhr.status !== 404;
    } catch (exception) {
      console.log(exception);
      return false;
    }
    return false;
  };

  /*const informSnackBar = (message) => {
    dispatch(setCurrentItemAction(itemProperties));
  }
  */
  const getResourcePathURL = (item) => {
    if(item.fileUUId) {
      return (resourcePathURL || '') + item.fileUUId + '/';
    }
    return (resourcePathURL || '');
  }
  /*
  const getItemFileStackID =(item) => {
    if(item.fileUUId) {
      return (resourcePathURL || '') + item.fileUUId + '/' + item.fileStack;
    }
    return item.fileId;
  }
  const getItemFileOrderID =(item) => {
    if(item.fileUUId) {
      return (resourcePathURL || '') + item.fileUUId + '/' + item.fileMPPS;
    }
    return item.fileId;
  }
  const getItemFileKinematicID =(item) => {
    if(item.fileUUId) {
      return (resourcePathURL || '') + item.fileUUId + '/' + item.fileKinematic;
    }
    return item.fileId;
  }
  
  const getItemFileID =(item) => {
    if(item.fileUUId) {
      return (resourcePathURL || '') + item.fileUUId + '/' + item.fileStore;
    }
    return item.fileId;
  }
  const getItemFileGDTID =(item) => {
    if(item.fileUUId) {
      return (resourcePathURL || '') + item.fileUUId + '/' + item.fileGDT;
    }
    return item.fileId;
  }
  */
 
  const getStepFile = (item) => {
    if(item.fileUUId) {
      const fullpath = item.fileName;
      return fullpath.slice(6,fullpath.length);
    }
    return item.fileId;
  }
  const setStack = (item) => {
    if (!item.fileId && !item.fileUUId) {
      return;
    }
    if (!item.fileStack || item.fileStack === null) {
      console.log('Checking Store', item.fileStore);
      if (item.fileStore && item.fileStore.length > 0) {
        const fileStack =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'S0';
        console.log('Checking Stack', fileStack);
        if (doesFileExist(getResourcePathURL(item) + fileStack + '.gltf')) {
          console.log('Found', fileStack);
          item.fileStack = fileStack;
        } else {
          console.log('Stack Not Found', fileStack);
        }
      } else {
        console.log('Store Not Found', item.fileStore);
      }
    }
    if (!item.fileStack || item.fileStack === null) {
      //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
      setIsLoading(true);
      getPartsStackableInfo(
        getStepFile(item),
        STATEPROPS.distancegap,
        STATEPROPS.anglegap,
        STATEPROPS.animationtime
      )
        .then((res) => res.data)
        .then((repos) => {
          console.log(repos);
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
            treeLength: repos['tree'].length,
          });
          setItemProperties((prevData) => ({
            ...prevData,
            fileStack: stack,
          }));
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
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
        item.fileUUId
      );
    }
  };

  const setOrder = (item) => {
    if (!item.fileId && !item.fileUUId) {
      return;
    }
    if (!item.fileMPPS || item.fileMPPS === null) {
      console.log('Checking Store', item.fileStore);
      if (item.fileStore && item.fileStore.length > 0) {
        const fileMPPS =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'M0';
        console.log('Checking Order', fileMPPS);
        if (doesFileExist(getResourcePathURL(item) + fileMPPS + '.gltf')) {
          console.log('Found', fileMPPS);
          item.fileMPPS = fileMPPS;
        } else {
          console.log('Order Not Found', fileMPPS);
        }
      } else {
        console.log('Store Not Found', item.fileStore);
      }
    }
    if (!item.fileMPPS || item.fileMPPS === null) {
      //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
      setIsLoading(true);
      console.log('Setting here');
      getPartsAssemblyOrder(
        getStepFile(item),
        STATEPROPS.distancegap,
        STATEPROPS.anglegap,
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
            treeLength: repos['tree'].length,
          });
          setItemProperties((prevData) => ({
            ...prevData,
            fileMPPS: mpps,
          }));
          setIsLoading(false);
          console.log('Done');
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
        item.fileUUId
      );
    }
  };
  const setGLTFAndTree = async (item, myTabedIndex) => {
    if (myTabedIndex == tabIndex) {
      if ((!item.fileId && !item.fileUUId) || !parserNeeded.includes(myTabedIndex)) {
        setIsLoading(false);
        return;
      }
      let myTabIndex = myTabedIndex == 'iupc' ? 'gdtac' : myTabedIndex;
      if (myTabIndex == 'iupc') {
        console.log('Checking iupc', myTabIndex, item);
        if (!item.fileKinematic || item.fileKinematic === null) {
          console.log('Checking Store', item.fileStore);
          if (item.fileStore && item.fileStore.length > 0) {
            const fileKinematic =
              item.fileStore.slice(0, item.fileStore.length - 1) + 'K0';
            console.log('Checking Kinematic', fileKinematic);
            if (doesFileExist(getResourcePathURL(item) + fileKinematic + '.gltf')) {
              console.log('Found', fileKinematic);
              item.fileKinematic = fileKinematic;
            } else {
              console.log('Kinematic Not Found', fileKinematic);
            }
          } else {
            console.log('Store Not Found', item.fileStore);
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
          getPartsKinematicOrder(
            getStepFile(item),
            STATEPROPS.distancegap,
            STATEPROPS.anglegap,
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
                treeLength: repos['tree'].length,
              });
              setItemProperties((prevData) => ({
                ...prevData,
                fileKinematic: kinematic,
              }));
              setIsLoading(false);
            })
            .catch((err) => {
              setIsLoading(false);
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
            item.fileUUId
          );
        }
      } else if (myTabIndex == 'pdcu') {
        if (!item.fileStore || item.fileStore === null) {
          //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
          setIsLoading(true);
          setProgressBarLoad(true);
          let percent = 0;
          const getHierarchyRes = await getHierarchySplitFiles(
            getStepFile(item),
            true,
            STATEPROPS.distancegap,
            STATEPROPS.anglegap,
            STATEPROPS.disect,
            0,
            0,
            0,
            STATEPROPS.maximumfaces
          );
          
          let datastore = getHierarchyRes.data.store;
          let dataload = getHierarchyRes.data.load;
          const datastatus = getHierarchyRes.data.status;
         
          if(datastatus) {
            percent = datastatus.percent;
          } 
          setPercentage(percent);
          if((!datastore || (percent!=100)) && (item.fileUUId)){            
            if(!datastore) {             
              setIsLoading(false);
              console.log('Error While Parsing',item);
            } else {
              const datafile = item.fileUUId+"/"+datastore;
              let fetchStatus = () => getAFileFromStore(datafile,"status");
              let validateStatus = (result) => { 
                //console.log(result.data,result.data.percent,result.data.percent!=100);
                return (result.data.percent!=100);
              };
              let percentFunction = (result) => result.data.percent?result.data.percent:percentage;
              console.log("Entering poll",datastore,dataload);
              await pollFunction(fetchStatus, validateStatus, 20000, setPercentage,percentFunction);
              console.log("Completing poll",datastore,dataload);
              const gltfRes = await getAFileFromStore(datafile,"gltf");
              const treeRes = await getAFileFromStore(datafile,"tree");
              const multiAssmebly = get(treeRes.data, 'tree', []).length > 0;
              setgltfjson({ gltf:gltfRes.data, 
                tree:treeRes.data, 
                multiAssmebly: multiAssmebly, 
                kinematic: item.fileKinematic,
                mpps: item.fileMPPS,
                stack: item.fileStack,
                gdt: item.fileGDT,                  
                treeLength: treeRes.data.length 
              });
              setItemProperties((prevData) => ({
                ...prevData,
                fileStore: datastore,
              }));
            }
            
          } else {
            if(!datastore) {             
              setIsLoading(false);
              console.log('Error While Parsing',item);
            } else {
              const treeLength = get(getHierarchyRes.data, 'tree', []).length;
              const multiAssmebly = treeLength > 0;
              setgltfjson({ ...getHierarchyRes.data,  
                multiAssmebly: multiAssmebly, 
                kinematic: item.fileKinematic,
                mpps: item.fileMPPS,
                stack: item.fileStack,
                gdt: item.fileGDT,                  
                treeLength: treeLength 
              });
              setItemProperties((prevData) => ({
                ...prevData,
                fileStore: datastore,
              }));  
            }
      
          }
          setProgressBarLoad(false);
          /* 
          getHierarchySplitFiles(
            getItemFileID(item),
            true,
            STATEPROPS.distancegap,
            STATEPROPS.anglegap,
            STATEPROPS.disect,
            0,
            0,
            0,
            STATEPROPS.maximumfaces
          )
            .then((res) => res.data)
            .then((repos) => {
              const multiAssmebly = get(repos, 'tree', []).length > 0;
              const store = repos['store'];
              item.fileStore = store;
              console.log('Fetching Data', {
                ...repos,
                kinematic: item.fileKinematic,
                mpps: item.fileMPPS,
                stack: item.fileStack,
                gdt: item.fileGDT,
                multiAssmebly: multiAssmebly,
              });
              setgltfjson({
                ...repos,
                kinematic: item.fileKinematic,
                mpps: item.fileMPPS,
                stack: item.fileStack,
                gdt: item.fileGDT,
                multiAssmebly: multiAssmebly,
                treeLength: repos['tree'].length,
              });
              setItemProperties((prevData) => ({
                ...prevData,
                fileStore: store,
              }));
              setIsLoading(false);
            })
            .catch((err) => {
              setIsLoading(false);
              console.log('Error While Parsing', err);
            });
            
          */

        } else {
          console.log("Up1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
          fetchGLTFAndTree(
            myTabIndex,
            item.fileStore,
            item.fileGDT,
            item.fileMPPS,
            item.fileStack,
            item.fileKinematic,
            item.fileUUId
          );
        }
      } else {
        if (!item.fileGDT || item.fileGDT === null) {
          console.log('Checking Store', item.fileStore);
          if (item.fileStore && item.fileStore.length > 0) {
            const fileGDT =
              item.fileStore.slice(0, item.fileStore.length - 1) + '3';
            console.log('Checking GDT', fileGDT);
            if (doesFileExist(getResourcePathURL(item) + fileGDT + '.gltf')) {
              console.log('Found', fileGDT);
              item.fileGDT = fileGDT;
            } else {
              if (doesFileExist(getResourcePathURL(item) + fileGDT + '.status')) {
                console.log('Found status', fileGDT);
                item.fileGDT = fileGDT;
              }else {
                console.log('GDT Not Found', fileGDT);
              }
             
            }
          } else {
            console.log('Store Not Found', item.fileStore);
          }
        }
        if (!item.fileGDT || item.fileGDT === null) {
          //console.log("Down0f",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId,isLoading);

          setIsLoading(true);
          setProgressBarLoad(true);
          let percent = 0;
          const getHierarchyRes = await getHierarchySplitFiles(
            getStepFile(item),
            true,
            STATEPROPS.distancegap,
            STATEPROPS.anglegap,
            STATEPROPS.disect,
            0,
            STATEPROPS.edgesize,
            STATEPROPS.vertexsize,
            STATEPROPS.maximumfaces
          );
          
          let datastore = getHierarchyRes.data.store;
          let dataload = getHierarchyRes.data.load;
          const datastatus = getHierarchyRes.data.status;
         
          if(datastatus) {
            percent = datastatus.percent;
          } 
          setPercentage(percent);
          if((!datastore || (percent!=100)) && (item.fileUUId)){            
            if(!datastore) {             
              setIsLoading(false);
              console.log('Error While Parsing',item);
            } else {
              const datafile = item.fileUUId+"/"+datastore;
              let fetchStatus = () => getAFileFromStore(datafile,"status");
              let validateStatus = (result) => { 
                //console.log(result.data,result.data.percent,result.data.percent!=100);
                return (result.data.percent!=100);
              };
              let percentFunction = (result) => result.data.percent?result.data.percent:percentage;
              console.log("Entering poll",datastore,dataload);
              await pollFunction(fetchStatus, validateStatus, 20000, setPercentage,percentFunction);
              console.log("Completing poll",datastore,dataload);
              const gltfRes = await getAFileFromStore(datafile,"gltf");
              const treeRes = await getAFileFromStore(datafile,"tree");
              const multiAssmebly = treeRes.data.length > 0;
              setgltfjson({ gltf:gltfRes.data, 
                tree:treeRes.data, 
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
                fileGDT: datastore,
              }));
            }
            
          } else {
            if(!datastore) {             
              setIsLoading(false);
              console.log('Error While Parsing',item);
            } else {
              const treeLength = get(getHierarchyRes.data, 'tree', []).length;
              const multiAssmebly = treeLength > 0;
              setgltfjson({ ...getHierarchyRes.data,  
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
                fileGDT: datastore,
              }));  
            }
      
          }
          setProgressBarLoad(false);
          setIsLoading(false);
          /*
          //console.log("Down0t",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId,isLoading);
          getHierarchySplitFiles(
            getItemFileGDTID(item),
            true,
            STATEPROPS.distancegap,
            STATEPROPS.anglegap,
            STATEPROPS.disect,
            0,
            STATEPROPS.edgesize,
            STATEPROPS.vertexsize,
            STATEPROPS.maximumfaces
          )
            .then((res) => res.data)
            .then((repos) => {
              const gdt = repos['store'];
              item.fileGDT = gdt;
              console.log('Fetching Data', {
                ...repos,
                kinematic: item.fileKinematic,
                mpps: item.fileMPPS,
                stack: item.fileStack,
                gdt: gdt,
                store: item.fileStore,
              });

              setgltfjson({
                ...repos,
                kinematic: item.fileKinematic,
                mpps: item.fileMPPS,
                stack: item.fileStack,
                gdt: gdt,
                store: item.fileStore,
                treeLength: repos['tree'].length,
              });
              //console.log("After getting reposi",repos, {...repos,gdt:gdt,store:item.fileStore},isLoading);
              setItemProperties((prevData) => ({
                ...prevData,
                fileGDT: gdt,
              }));
              //console.log("After getting reposf",repos, {...repos,gdt:gdt,store:item.fileStore},isLoading);
              setIsLoading(false);
              //console.log("Setting False to show gltf");
            })
            .catch((err) => {
              setIsLoading(false);
              console.log('Error While Disecting', err);
            });

          */
        } else {
          console.log("Down1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
          fetchGLTFAndTree(
            myTabIndex,
            item.fileStore,
            item.fileGDT,
            item.fileMPPS,
            item.fileStack,
            item.fileKinematic,
            item.fileUUId
          );
        }
      }
    } else {
      //console.log("Else",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
    }
  };
  const handleCopyId = (event) => {
    navigator.clipboard.writeText(id);
    console.log('---', id);
    event.stopPropagation();
  };
  const fetchGLTFAndTree = async (
    myTabedIndex,
    fileStore,
    fileGDT,
    fileMPPS,
    fileStack,
    fileKinematic,
    fileUUId
  ) => {
    try {
      let obj = {
        gltf: {},
        tree: {},
        store: fileStore,
        gdt: fileGDT,
        mpps: fileMPPS,
        stack: fileStack,
        kinematic: fileKinematic,
      };
      setIsLoading(true);
      let myTabIndex = myTabedIndex=='iupc' ? 'gdtac' : myTabedIndex; 
      let whichOneToLoad = fileUUId ? fileUUId+'/': '';
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
      if(fileUUId) {
        const statusRes = await getAFileFromStore(whichOneToLoad,'status');
        let percent = 0;
        if(statusRes) {
          percent = statusRes.percent;
        } 
        setPercentage(percent);
        if(percent!=100) {
          
          const datafile = whichOneToLoad;
          let fetchStatus = () => getAFileFromStore(datafile,"status");
          let validateStatus = (result) => { 
            //console.log(result.data,result.data.percent,result.data.percent!=100);
            return (result.data.percent!=100);
          };
          let percentFunction = (result) => result.data.percent?result.data.percent:percentage;
          console.log("Entering poll",datafile);
          await pollFunction(fetchStatus, validateStatus, 20000, setPercentage,percentFunction);
          console.log("Completing poll",datafile);
          
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
      console.log('Fetched Data', {
        ...obj,
        gltf: gltfRes.data,
        tree: treeRes.data,
        stackable: stackRes.data,
        assemblyorder: orderRes.data,
        multiAssmebly: multiAssmebly,
        gdttable: gdtRes.data,
        treeLength: treeRes.data.length,
      });
      
      setgltfjson({
        ...obj,
        gltf: gltfRes.data,
        tree: treeRes.data,
        stackable: stackRes.data,
        assemblyorder: orderRes.data,
        multiAssmebly: multiAssmebly,
        gdttable: gdtRes.data,
        treeLength: treeRes.data.length,
      });      
      setIsLoading(false);
      setProgressBarLoad(false);
    } catch (error) {
      setIsLoading(false);
      console.log('Error in FetchGLTFAndTree', error);
    }
  };
  const additionalSaveFunction = (saveFunction) => {
    state_additionalSaveFunction = saveFunction;
  };
  const renderPageSwitch = () => {
    if (!get(itemProperties, '_id')) {
      console.log("I Could not get id in rendePageSwithc",itemProperties);
      return null;
    }
    //console.log(itemProperties,itemProperties.fileId);
    if ( (tabIndex!='gdtac') && (tabIndex!='iupc') && (tabIndex!='mpps') ) {
      additionalSaveFunction(null);
    }
    switch (tabIndex) {
      case 0:
        return 'Add vendor items here';
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
          />
        );
      case 'cu':
        return <CurrentUsage itemId={id} />;
      case 'gdtac':
        console.log(itemProperties, itemProperties.fileGDT, itemProperties.fileUUId);
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
            //informSnackBar={informSnackBar}
          />
        );
      case 'iupc':
        console.log('IUPC', itemProperties, gltfjson);
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
        console.log("Result",res);
        setItemProperties(res.data);
        dispatch(showSuccessAlert({ message: 'Item Updated' }));
      })
      .catch((error) => {
        console.log("Error while Saving",error);
        dispatch(showErrorAlert({ message: 'Unable to save info' }));
      });
    try {
      if (state_additionalSaveFunction) {
        console.log('Saving additional info');
        state_additionalSaveFunction();
      }
    } catch (error) {
      console.log('Error while saving', error);
    }
  };

  const handleTabChange = (event, newTabIndex) => {
    console.log("Pressed Index",tabIndex,newTabIndex);
    if (tabIndex !== newTabIndex) {
      setIsLoading(true);
      setTabIndex(newTabIndex);
      //setGLTFAndTree(currentItem,newTabIndex);
      //setIsLoading(false);
      history.push({
        pathname: `/items/${id}`,
        search: `?tab=${newTabIndex}`,
      });
    }
    //console.log("IsLoading, inside",isLoading);
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
    production: 'Production',
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
      <LoadingModal isLoading={isLoading} />
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
          left: '10%',
        }}
        open={true}
      >
        <Button
          size="large"
          variant="contained"
          color="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </Snackbar>
    </>
  );
};

export default ItemDetail;
