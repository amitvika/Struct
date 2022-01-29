import { createChildItems } from '@monostruct/common/containers/BaseItemPropertiesTab/helper';

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
    showKinematicMove,
    regenerateKinematicMove
  } = props;
  let updatedItemProp = {};
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
    let percent = 0;
    if (fileUUId && okToParse == PROCESSINGSTATUS.INPROGRESS) {
      // statusRes = await getAFileFromStore(whichOneToLoad, 'status');
      percent = 0;
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
    } else {
      percent = 100;
    }

    //
    const myResourcePath = await checkExistingPathFromStore(
      whichOneToLoad,
      'gltf'
    );
    console.log('got percent', percent, whichOneToLoad, myResourcePath);
    //
    const gltfRes = await getAFileFromURLStore(
      whichOneToLoad,
      'gltf',
      myResourcePath,
      percent
    );
    const treeRes = await getAFileFromURLStore(
      whichOneToLoad,
      'tree',
      myResourcePath,
      percent
    );
    let stackRes = { data: null };
    let orderRes = { data: null };
    let gdtRes = { data: null };
    if (myTabIndex == 'stack') {
      stackRes = await getAFileFromURLStore(
        whichOneToLoad,
        'stack',
        myResourcePath,
        percent
      );
    }
    if (myTabIndex == 'mpps') {
      orderRes = await getAFileFromURLStore(
        whichOneToLoad,
        'order',
        myResourcePath,
        percent
      );
    }
    if (myTabIndex == 'gdtac') {
      gdtRes = await getAFileFromURLStore(
        whichOneToLoad,
        'gdt',
        myResourcePath,
        percent
      );
      console.log('WhichOneToLoad', whichOneToLoad, gdtRes, myResourcePath);
    }

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
      const comparison_parameters = statusRes.data ? statusRes.data : null;
      updatedItemProp = {
        multiAssembly: multiAssembly,
        stepTreeLength: treeRes.data.length,
        comparison_parameters: comparison_parameters
      };
    }

    return updatedItemProp;
  } catch (error) {
    setIsLoading(false);
  }
  return updatedItemProp;
};

export const isOKToParseForOtherTab = async ({ item }) => {
  let okToParse = PROCESSINGSTATUS.PROCESSED;
  if (!item.fileGDT || item.fileGDT === null) {
    if (item.fileStore && item.fileStore.length > 0) {
      const fileGDT = item.fileStore.slice(0, item.fileStore.length - 1) + '3';
      const whichOneToLoad = getResourcePathURL(item) + fileGDT;
      const whichOneToStatus = getStatusPathURL(item) + fileGDT;
      okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
      if (okToParse <= PROCESSINGSTATUS.INPROGRESS) {
        item.fileGDT = fileGDT;
      } else {
      }
    } else {
    }
  } else {
    const whichOneToLoad = getResourcePathURL(item) + item.fileGDT;
    const whichOneToStatus = getStatusPathURL(item) + item.fileGDT;
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
    STATEPROPS.animationtime,
    false,
    item.id || item._id
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
      const gltfRes = await getAFileFromStore(datafile, 'gltf', true);
      const treeRes = await getAFileFromStore(datafile, 'tree', true);
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
      const comparison_parameters = statusRes.data ? statusRes.data : null;
      updatedItemProp = {
        fileGDT: datastore,
        fileStore: fileStore,
        multiAssembly: multiAssembly,
        stepTreeLength: treeRes.data.length,
        comparison_parameters: comparison_parameters
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
      const comparison_parameters = getHierarchyRes
        ? getHierarchyRes.data
          ? getHierarchyRes.data.status
            ? getHierarchyRes.data.status
            : null
          : null
        : null;
      updatedItemProp = {
        fileGDT: datastore,
        fileStore: fileStore,
        multiAssembly: multiAssembly,
        stepTreeLength: treeLength,
        comparison_parameters: comparison_parameters
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
    itemProperties,
    setActiveGLTFile
  } = props;
  if (!item.fileId && !item.fileUUId) {
    return;
  }

  try {
    let okToParse = PROCESSINGSTATUS.PROCESSED;
    if (!item.fileStack || item.fileStack === null) {
      if (item.fileStore && item.fileStore.length > 0) {
        const fileStack =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'S0';
        const whichOneToLoad = getResourcePathURL(item) + fileStack;
        const whichOneToStatus = getStatusPathURL(item) + fileStack;
        okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
        if (okToParse <= PROCESSINGSTATUS.INPROGRESS) {
          item.fileStack = fileStack;
        } else {
        }
      } else {
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
      setProgressBarLoad(true);
      setIsLoading(true);
      setIsFileLoading(true);
      getPartsStackableInfo(
        getStepFile(item),
        item.distanceGap ? item.distanceGap : STATEPROPS.distancegap,
        item.angleGap ? item.angleGap : STATEPROPS.anglegap,
        STATEPROPS.animationtime,
        item.id || item._id
      )
        .then((res) => res.data)
        .then((repos) => {
          const stack = repos['store'];
          item.fileStack = stack;
          setgltfjson({
            ...repos,
            kinematic: item.fileKinematic,
            mpps: item.fileMPPS,
            store: item.fileStore,
            stack: stack,
            gdt: item.fileGDT,
            treeLength: repos['tree'].length,
            resourcepath: resourcePathURL
          });
          console.log('Setting active gltf file to', stack);
          setActiveGLTFile(stack);
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
        });
    } else {
      await fetchGLTFAndTree({
        myTabedIndex: 'stack',
        fileStore: item.fileStore,
        fileGDT: item.fileGDT,
        fileMPPS: item.fileMPPS,
        fileStack: item.fileStack,
        fileKinematic: item.fileKinematic,
        fileUUId: item.fileUUId,
        showKinematicMove: false,
        regenerateKinematicMove: 0,
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
      console.log('Setting active gltf file to', item.fileStack);
      setActiveGLTFile(item.fileStack);
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
  }
};

export const getOKTOParseForSetOrder = async ({ item }) => {
  try {
    let okToParse = PROCESSINGSTATUS.PROCESSED;
    if (!item.fileMPPS || item.fileMPPS === null) {
      if (item.fileStore && item.fileStore.length > 0) {
        const fileMPPS =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'M0';
        const whichOneToLoad = getResourcePathURL(item) + fileMPPS;
        const whichOneToStatus = getStatusPathURL(item) + fileMPPS;
        okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
        if (okToParse <= PROCESSINGSTATUS.INPROGRESS) {
          item.fileMPPS = fileMPPS;
        } else {
        }
      } else {
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
  } catch (error) {}
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
    setItemProperties,
    setActiveGLTFile
  } = props;
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
      STATEPROPS.animationtime,
      item.id || item._id
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
        const gltfRes = await getAFileFromStore(datafile, 'gltf', true);
        const treeRes = await getAFileFromStore(datafile, 'tree', true);
        const orderRes = await getAFileFromStore(datafile, 'order', true);

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
        console.log('Setting active gltf file to', mpps);
        setActiveGLTFile(mpps);
        setItemProperties((prevData) => ({
          ...prevData,
          fileMPPS: mpps
        }));
        setIsLoading(false);
        setIsFileLoading(false);
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
      console.log('Setting active gltf file to', item.fileMPPS);
      setActiveGLTFile(item.fileMPPS);
      setIsLoading(false);
      setIsFileLoading(false);
    }
    setProgressBarLoad(false);
  } catch (error) {
    setIsLoading(false);
    setIsFileLoading(false);
    setProgressBarLoad(false);
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
  } catch (error) {}
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
    STATEPROPS.animationtime,
    false,
    item.id || item._id
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
      const gltfRes = await getAFileFromStore(datafile, 'gltf', true);
      const treeRes = await getAFileFromStore(datafile, 'tree', true);
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
      const comparison_parameters = statusRes.data ? statusRes.data : null;
      return {
        fileStore: datastore,
        multiAssembly: multiAssembly,
        stepTreeLength: treeRes.data.length,
        comparison_parameters: comparison_parameters
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
      const comparison_parameters = getHierarchyRes
        ? getHierarchyRes.data
          ? getHierarchyRes.data.status
            ? getHierarchyRes.data.status
            : null
          : null
        : null;
      return {
        fileStore: datastore,
        multiAssembly: multiAssembly,
        stepTreeLength: treeLength,
        comparison_parameters: comparison_parameters
      };
    }
  }
  setIsLoading(false);
  setIsFileLoading(false);
  setProgressBarLoad(false);
};

export const isOKToParseForInternalUseProduct = async ({
  item,
  regenerateKinematicMove
}) => {
  if (regenerateKinematicMove) {
    item.fileKinematic = null;
    return PROCESSINGSTATUS.HUNG;
  }
  let okToParse = PROCESSINGSTATUS.PROCESSED;
  try {
    if (!item.fileKinematic || item.fileKinematic === null) {
      if (item.fileStore && item.fileStore.length > 0) {
        const fileKinematic =
          item.fileStore.slice(0, item.fileStore.length - 1) + 'R0';
        const whichOneToLoad = getResourcePathURL(item) + fileKinematic;
        const whichOneToStatus = getStatusPathURL(item) + fileKinematic;
        okToParse = await checkStatusToParse(whichOneToLoad, whichOneToStatus);
        if (okToParse <= PROCESSINGSTATUS.INPROGRESS) {
          item.fileKinematic = fileKinematic;
        } else {
        }
      } else {
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
      kinematicItemList,
      item.id || item._id
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
          return result.data.percent !== 100;
        };
        let percentFunction = (result) =>
          result.data.percent ? result.data.percent : percentage;
        console.log('Started getting here kineamtic status', datafile);
        const statusRes = await pollFunction(
          fetchStatus,
          validateStatus,
          20000,
          setPercentage,
          percentFunction,
          setCurrentProgressText,
          setCompletionProgressText
        );
        console.log('Finally got here kineamtic status', statusRes);
        const gltfRes = await getAFileFromStore(datafile, 'gltf', true);
        const treeRes = await getAFileFromStore(datafile, 'tree', true);
        console.log('Setting', gltfRes, treeRes);
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
    return PROCESSINGSTATUS.PROCESSED;
  }
  const statusURL = `${resourceStatusURL}${whichOneToStatus}.status`;
  if (isFileExistingInServer(statusURL)) {
    const statusRes = await getAFileFromStore(whichOneToStatus, 'status');
    let percent = 0;
    if (
      statusRes &&
      statusRes.data &&
      !isEmptyObjectDictionary(statusRes.data)
    ) {
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
    if (difference > 5 * 60) {
      // Increased from 2 to 5 since some file takes ~ 4 mins to load into memory..
      return PROCESSINGSTATUS.HUNG;
    }
    return PROCESSINGSTATUS.INPROGRESS;
  }
  return PROCESSINGSTATUS.NOTSTARTED;
};
