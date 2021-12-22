import { createChildItems } from './baseItemProperties/helper';

import {
  STATEPROPS,
  PROCESSINGSTATUS,
  pollFunction,
  isEmptyObjectDictionary
} from '@monostruct/common/gltf/Tree/utils';

import {
  getPartsStackableInfo,
  getPartsAssemblyOrder,
  getPartsKinematicMovement,
  getHierarchySplitFiles,
  getAFileFromStore,
  resourcePathURL,
  resourceStatusURL,
  isFileExistingInServer,
  checkExistingPathFromStore,
  getAFileFromURLStore
} from '@monostruct/common/api/fileUpload.api';
import get from 'lodash/get';

export const fetchGLTFAndTree = async (props) => {
  const {
    myTabedIndex,
    fileStore,
    fileGDT,
    fileMPPS,
    fileStack,
    fileKinematic,
    fileUUId,
    okToParse,
    setIsLoading,
    setProgressBarLoad,
    percentage,
    setPercentage,
    setCurrentProgressText,
    setCompletionProgressText,
    setgltfjson,
    showKinematicMove
  } = props;
  let updatedItemProp = {};
  try {
    console.log('----------', props);
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
      (myTabedIndex === 'iupc' && !showKinematicMove) || myTabedIndex == 'pdcu'
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
    let statusRes = await getAFileFromStore(whichOneToLoad, 'status');
    if (fileUUId && okToParse == PROCESSINGSTATUS.INPROGRESS) {
      // statusRes = await getAFileFromStore(whichOneToLoad, 'status');
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
        statusRes = await pollFunction(
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
    console.log(
      'Fetching files, ',
      fileUUId,
      whichOneToLoad,
      myTabIndex,
      myTabedIndex
    );
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
    console.log(
      myResourcePath,
      obj,
      gltfRes.data,
      treeRes.data,
      stackRes.data,
      orderRes.data,
      gdtRes.data
    );
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
    if (myTabIndex == 'gdtac') {
      const multiAssembly = statusRes
        ? statusRes.data
          ? statusRes.data.assemblies > 1
          : false
        : false;
      updatedItemProp = {
        multiAssembly: multiAssembly,
        stepTreeLength: treeRes.data.length
      };
    }

    return updatedItemProp;
  } catch (error) {
    console.log(error);
    setIsLoading(false);
  }
  return updatedItemProp;
};

export const isOKToParseForOtherTab = async ({ item }) => {
  let okToParse = PROCESSINGSTATUS.PROCESSED;
  //console.log('Item in parsing', item);
  if (!item.fileGDT || item.fileGDT === null) {
    //console.log('Item in parsing 2', item);
    if (item.fileStore && item.fileStore.length > 0) {
      const fileGDT = item.fileStore.slice(0, item.fileStore.length - 1) + '3';
      const whichOneToLoad = getResourcePathURL(item) + fileGDT;
      const whichOneToStatus = getStatusPathURL(item) + fileGDT;
      //console.log('Item in parsing 3', item, whichOneToLoad, whichOneToStatus);
      okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
      if (okToParse <= PROCESSINGSTATUS.INPROGRESS) {
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
    //console.log('Item in parsing 4', item, whichOneToLoad, whichOneToStatus);
    okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
    if (okToParse > PROCESSINGSTATUS.INPROGRESS) {
      item.fileGDT = null;
    }
  }
  return okToParse;
};

export const handleOtherTabCase = async (props) => {
  const {
    item,
    myTabedIndex,
    myTabIndex,
    setIsLoading,
    setIsFileLoading,
    setProgressBarLoad,
    allowFirstLevelItems,
    createAutoAssemblyOrder,
    createAutoStackability,
    setPercentage,
    percentage,
    setCurrentProgressText,
    setCompletionProgressText,
    setgltfjson,
    setCenterActionText,
    setItemProperties
  } = props;
  console.log('handleOtherTabCase', props);
  let updatedItemProp = {};

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
    false,
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

      updatedItemProp = {
        fileGDT: datastore,
        fileStore: fileStore,
        multiAssembly: multiAssembly,
        stepTreeLength: treeRes.data.length
      };
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

      updatedItemProp = {
        fileGDT: datastore,
        fileStore: fileStore,
        multiAssembly: multiAssembly,
        stepTreeLength: treeLength
      };
    }
  }
  if (allowFirstLevelItems && datastore) {
    if (item.child_item_status === 'INITIATED') {
      const itemClone = { ...item, fileGDT: datastore };
      const childrenCreated = await createChildItems({
        item: itemClone,
        percentage,
        setPercentage,
        setCurrentProgressText,
        setCompletionProgressText,
        setCenterActionText,
        setIsLoading,
        setIsFileLoading,
        setProgressBarLoad
      });
      if (childrenCreated) {
        updatedItemProp = {
          ...updatedItemProp,
          child_item_status: 'COMPLETED'
        };
      }
    }
  }
  setProgressBarLoad(false);
  setIsLoading(false);
  setIsFileLoading(false);
  return updatedItemProp;
};

export const setStack = async (props) => {
  const {
    item,
    setIsLoading,
    setIsFileLoading,
    setProgressBarLoad,
    setPercentage,
    percentage,
    setCurrentProgressText,
    setCompletionProgressText,
    setgltfjson,
    setItemProperties,
    itemProperties
  } = props;
  console.log('SetStack', props);
  if (!item.fileId && !item.fileUUId) {
    return;
  }

  try {
    let okToParse = PROCESSINGSTATUS.PROCESSED;
    if (!item.fileStack || item.fileStack === null) {
      //console.log('Checking Store', item.fileStore);
      if (item.fileStore && item.fileStore.length > 0) {
        const fileStack =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'S0';
        //console.log('Checking Stack', fileStack);
        const whichOneToLoad = getResourcePathURL(item) + fileStack;
        const whichOneToStatus = getStatusPathURL(item) + fileStack;
        okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
        if (okToParse <= PROCESSINGSTATUS.INPROGRESS) {
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
      if (okToParse > PROCESSINGSTATUS.INPROGRESS) {
        item.fileStack = null;
      }
    }
    if (!item.fileStack || item.fileStack === null) {
      //console.log("Up0",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
      setProgressBarLoad(true);
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
          setProgressBarLoad(false);
        })
        .catch((err) => {
          setIsLoading(false);
          setIsFileLoading(false);
          setProgressBarLoad(false);
          console.log('Error While Parsing', err);
        });
    } else {
      //console.log("Up1",myTabIndex,tabIndex,item.fileStore,item.fileGDT,item.fileId);
      fetchGLTFAndTree({
        myTabedIndex: 'stack',
        fileStore: item.fileStore,
        fileGDT: item.fileGDT,
        fileMPPS: item.fileMPPS,
        fileStack: item.fileStack,
        fileKinematic: item.fileKinematic,
        fileUUId: item.fileUUId,
        showKinematicMove: false,
        okToParse,
        setIsLoading,
        setIsFileLoading,
        setProgressBarLoad,
        setPercentage,
        percentage,
        setCurrentProgressText,
        setCompletionProgressText,
        setgltfjson,
        setItemProperties
      });
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

export const getOKTOParseForSetOrder = async ({ item }) => {
  try {
    let okToParse = PROCESSINGSTATUS.PROCESSED;
    if (!item.fileMPPS || item.fileMPPS === null) {
      //console.log('Checking Store', item.fileStore);
      if (item.fileStore && item.fileStore.length > 0) {
        const fileMPPS =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'M0';
        //console.log('Checking Order', fileMPPS);
        const whichOneToLoad = getResourcePathURL(item) + fileMPPS;
        const whichOneToStatus = getStatusPathURL(item) + fileMPPS;
        okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
        if (okToParse <= PROCESSINGSTATUS.INPROGRESS) {
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
      if (okToParse > PROCESSINGSTATUS.INPROGRESS) {
        item.fileMPPS = null;
      }
    }
    return okToParse;
  } catch (error) {
    console.log(error, item);
  }
};

export const setOrder = async (props) => {
  const {
    item,
    setIsLoading,
    setIsFileLoading,
    setProgressBarLoad,
    setPercentage,
    percentage,
    setCurrentProgressText,
    setCompletionProgressText,
    setgltfjson,
    setItemProperties
  } = props;
  console.log('Set Order', props);
  try {
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
  } catch (error) {
    setIsLoading(false);
    setIsFileLoading(false);
    setProgressBarLoad(false);
    console.log('Error in SetOrder', error);
  }
};

export const isOKToParseForProductDesignTab = async ({ item }) => {
  try {
    let okToParse = PROCESSINGSTATUS.PROCESSED;
    if (item.fileStore) {
      const whichOneToLoad = getResourcePathURL(item) + item.fileStore;
      const whichOneToStatus = getStatusPathURL(item) + item.fileStore;
      okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
    } else {
      okToParse = PROCESSINGSTATUS.HUNG;
    }
    return okToParse;
  } catch (error) {
    console.log('Error: isOKToParseForProductDesignTab', error);
  }
  return PROCESSINGSTATUS.HUNG;
};

export const handleProductDesignTab = async (props) => {
  const {
    item,
    myTabedIndex,
    setIsLoading,
    setIsFileLoading,
    setProgressBarLoad,
    allowFirstLevelItems,
    createAutoAssemblyOrder,
    createAutoStackability,
    percentage,
    setPercentage,
    setCurrentProgressText,
    setCompletionProgressText,
    setgltfjson,
    setItemProperties
  } = props;
  console.log('handleProductDesignTab', props);
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
    false,
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

  // setPercentage(percent);

  if ((!datastore || percent !== 100) && item.fileUUId) {
    if (datastore) {
      const datafile = item.fileUUId + '/' + datastore;
      let fetchStatus = () => getAFileFromStore(datafile, 'status');
      let validateStatus = (result) => {
        //console.log(result.data,result.data.percent,result.data.percent!=100);
        return result.data.percent !== 100;
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
      setIsLoading(false);
      setIsFileLoading(false);
      return {
        fileStore: datastore,
        multiAssembly: multiAssembly,
        stepTreeLength: treeRes.data.length
      };
    }
  } else {
    if (datastore) {
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
      setIsLoading(false);
      setIsFileLoading(false);
      return {
        fileStore: datastore,
        multiAssembly: multiAssembly,
        stepTreeLength: treeLength
      };
    }
  }
  setIsLoading(false);
  setIsFileLoading(false);
  setProgressBarLoad(false);
};

export const isOKToParseForInternalUseProduct = async ({ item }) => {
  let okToParse = PROCESSINGSTATUS.PROCESSED;
  try {
    if (!item.fileKinematic || item.fileKinematic === null) {
      //console.log('Checking Store', item.fileStore);
      if (item.fileStore && item.fileStore.length > 0) {
        const fileKinematic =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'R0';
        //console.log('Checking Kinematic', fileKinematic);
        const whichOneToLoad = getResourcePathURL(item) + fileKinematic;
        const whichOneToStatus = getStatusPathURL(item) + fileKinematic;
        okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
        if (okToParse <= PROCESSINGSTATUS.INPROGRESS) {
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
      if (okToParse > PROCESSINGSTATUS.INPROGRESS) {
        item.fileKinematic = null;
      }
    }
    return okToParse;
  } catch (error) {
    console.log('Error: isOKToParseForInternalUseProduct', error);
    return okToParse;
  }
};

export const handleInternalUseProduct = async (props) => {
  const {
    item,
    setIsLoading,
    setIsFileLoading,
    setProgressBarLoad,
    percentage,
    setPercentage,
    setCurrentProgressText,
    setCompletionProgressText,
    setgltfjson,
    kinematicItemList
  } = props;
  console.log('handleInternalUseProduct', props);
  setIsLoading(true);
  setIsFileLoading(true);
  setProgressBarLoad(true);
  let percent = 0;
  try {
    const getHierarchyRes = await getPartsKinematicMovement(
      getStepFile(item),
      item.distanceGap ? item.distanceGap : STATEPROPS.distancegap,
      item.angleGap ? item.angleGap : STATEPROPS.anglegap,
      STATEPROPS.animationtime,
      kinematicItemList
    );

    setIsFileLoading(false);
    let datastore = getHierarchyRes.data.store;
    let dataload = getHierarchyRes.data.load;
    const datastatus = getHierarchyRes.data.status;

    if (datastatus) {
      percent = datastatus.percent;
    }

    // setPercentage(percent);

    if ((!datastore || percent !== 100) && item.fileUUId) {
      if (datastore) {
        const datafile = item.fileUUId + '/' + datastore;
        let fetchStatus = () => getAFileFromStore(datafile, 'status');
        let validateStatus = (result) => {
          //console.log(result.data,result.data.percent,result.data.percent!=100);
          return result.data.percent !== 100;
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

        setgltfjson({
          gltf: gltfRes.data,
          tree: treeRes.data,
          kinematic: datastore,
          resourcepath: resourcePathURL
        });
        setIsLoading(false);
        setIsFileLoading(false);
        return {
          fileKinematic: datastore
        };
      }
    } else {
      if (datastore) {
        //const multiAssembly = treeLength > 0;
        setgltfjson({
          ...getHierarchyRes.data,
          kinematic: datastore,
          resourcepath: resourcePathURL
        });
        setIsLoading(false);
        setIsFileLoading(false);
        return {
          fileKinematic: datastore
        };
      }
    }
    setIsLoading(false);
    setIsFileLoading(false);
    setProgressBarLoad(false);
    /* 



    const repos = partsKinematicOrderResp.data;
    const kinematic = repos['store'];
    item.fileKinematic = kinematic;

    setgltfjson({
      ...repos,
      kinematic: kinematic,
      mpps: item.fileMPPS,
      store: item.fileStore,
      stack: item.fileStack,
      gdt: item.fileGDT,
      treeLength: repos['tree'].length,
      resourcepath: resourcePathURL
    });

    return {
      fileKinematic: kinematic
    }; */
  } catch (error) {
    setIsLoading(false);
    setIsFileLoading(false);
    setProgressBarLoad(false);
    console.log('Error: handleInternalUseProduct', error);
  }
};

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

export const getStepFile = (item) => {
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
    console.log('Found gltf', whichOneToLoad, myResourcePath);
    return PROCESSINGSTATUS.PROCESSED;
  }
  const statusURL = `${resourceStatusURL}${whichOneToStatus}.status`;
  console.log('Checking Existing', statusURL);
  if (isFileExistingInServer(statusURL)) {
    console.log('Found status', statusURL);
    const statusRes = await getAFileFromStore(whichOneToStatus, 'status');
    let percent = 0;
    if (
      statusRes &&
      statusRes.data &&
      !isEmptyObjectDictionary(statusRes.data)
    ) {
      console.log('Status Result', statusRes, statusRes.data);
      percent = statusRes.data.percent;
      if (percent == 100) {
        return PROCESSINGSTATUS.PROCESSED;
      }
    } else {
      return PROCESSINGSTATUS.HUNG;
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
      console.log(
        'difference Result',
        currenttime,
        servertime,
        currenttimearray,
        servertimearray
      );
      return PROCESSINGSTATUS.HUNG;
    }
    console.log(
      'inporgress Result',
      currenttime,
      servertime,
      currenttimearray,
      servertimearray
    );
    return PROCESSINGSTATUS.INPROGRESS;
  }
  console.log('not started Result', statusURL);
  return PROCESSINGSTATUS.NOTSTARTED;
};

const handleCopyId = (event, id) => {
  navigator.clipboard.writeText(id);
  event.stopPropagation();
};
