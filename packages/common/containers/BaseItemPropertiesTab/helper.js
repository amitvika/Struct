import { get } from 'lodash';
import {
  getAFileFromStore,
  getHierarchySplitFiles,
  resourceStatusURL,
  isFileExistingInServer
} from '@monostruct/common/api/fileUpload.api';

import {
  pollFunction,
  PROCESSINGSTATUS,
  STATEPROPS,
  isEmptyObjectDictionary
} from '@monostruct/common/gltf/Tree/utils';
import { getStepFile } from '../../../internal-app/src/containers/itemDetail/ItemDetails.helper';

import NewItemAPI from '@monostruct/common/api/items.api';
import ItemAPI from '@monostruct/common/api/items.api';

const checkStatusToParse = async (whichOneToStatus) => {
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
      percent = statusRes.data.end
        ? (100 * statusRes.data.begin) / statusRes.data.end
        : 0;
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

export const createChildItems = async ({
  item,
  percentage,
  setPercentage,
  setCurrentProgressText,
  setCompletionProgressText,
  setCenterActionText,
  setIsLoading,
  setIsFileLoading,
  setProgressBarLoad
}) => {
  const fileUUId = item.fileUUId;
  const pathFileName = item.fileGDT.slice(0, -1);
  const parentId = item.id;
  try {
    setProgressBarLoad(true);
    setIsLoading(true);
    console.log('Child item creation started');
    setCenterActionText('Initial Parsing');

    let datafile = `${fileUUId}/${pathFileName}3`;

    let fetchStatus = () => getAFileFromStore(datafile, 'status');
    let validateStatus = (result) => {
      //console.log(result.data,result.data.percent,result.data.percent!=100);
      return result.data.percent !== 100;
    };
    let percentFunction = (result) =>
      result.data.percent ? result.data.percent : percentage;
    console.log('Entering poll', datafile, 'status');
    await pollFunction(
      fetchStatus,
      validateStatus,
      20000,
      setPercentage,
      percentFunction,
      setCurrentProgressText,
      setCompletionProgressText
    );

    setCenterActionText('Checking Creation');
    datafile = `${fileUUId}/${pathFileName}`;
    const okToParse = await checkStatusToParse(datafile);
    console.log('Oktoparse', okToParse);
    if (okToParse > PROCESSINGSTATUS.INPROGRESS) {
      setIsFileLoading(true);
      await getHierarchySplitFiles(
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
        true,
        false,
        false,
        false,
        STATEPROPS.explodegap,
        STATEPROPS.holescale,
        STATEPROPS.removegap,
        STATEPROPS.fromcenter,
        STATEPROPS.animationtime,
        true,
        item.id || item._id,
        item.name
      );
      setIsFileLoading(false);
    }

    fetchStatus = () => getAFileFromStore(datafile, 'status');
    validateStatus = (result) => {
      //console.log(result.data,result.data.percent,result.data.percent!=100);
      return (
        !result ||
        !result.data ||
        !result.data.begin ||
        result.data.begin !== result.data.end ||
        result.data.begin === 0 ||
        JSON.stringify(result.data) === JSON.stringify({})
      );
    };
    percentFunction = (result) =>
      result.data.end ? (100 * result.data.begin) / result.data.end : 0;
    console.log('Entering poll', datafile, 'status');
    const childRes = await pollFunction(
      fetchStatus,
      validateStatus,
      20000,
      setPercentage,
      percentFunction,
      setCurrentProgressText,
      setCompletionProgressText
    );

    /* 
    let fetchStatus = () => getAFileFromStore(datafile, 'progress');
    let validateStatus = (result) => {
      return !result.data.childwritten;
    };
    let percentFunction = (result) => result.data.childwritten;

    const childRes = await pollFunction(
      fetchStatus,
      validateStatus,
      30000,
      null,
      percentFunction,
      null,
      null
    );

    let fetchStatus = () => getAFileFromStore(datafile, 'progress');
    let validateStatus = (result) => {
      return !result.data.childwritten;
    };
    let percentFunction = (result) => result.data.childwritten;

    const childRes = await pollFunction(
      fetchStatus,
      validateStatus,
      30000,
      null,
      percentFunction,
      null,
      null
    );
    */
    // const childRes = await getAFileFromStore(datafile, 'progress'); avoided since pollfunction returns the same..
    if (
      !childRes ||
      !childRes.data ||
      childRes.data.begin != childRes.data.end ||
      childRes.data.begin == 0 ||
      JSON.stringify(childRes.data) == JSON.stringify({})
    ) {
      console.log('Error in child res', childRes);
      setIsLoading(false);
      setProgressBarLoad(false);
      setIsFileLoading(false);
      return false;
    }

    const itemapidetailsRes = await ItemAPI.getItemsAPI(`id=${parentId}`);
    if (
      !itemapidetailsRes ||
      !itemapidetailsRes.data ||
      itemapidetailsRes.data[0].child_item_status === 'INITIATED'
    ) {
      const childFiles = get(childRes, 'data.childfiles', []);
      setCenterActionText('Started Creation');
      console.log('ChildFiles', childFiles);

      const newItem = childFiles.map((item) => ({
        fileUUId: item[0],
        name:
          item.length > 5 ? item[5] || item[2] || item[1] : item[2] || item[1],
        fileName: `Media/${item[0]}/${item[1]}.step`,
        fileStore: `${item[1]}0`,
        parent_id: parentId,
        is_child_item: true,
        filePartName: item[2],
        multiAssembly: item.length > 3 ? item[3] > 1 : false,
        treeLength: item.length > 4 ? item[4] : 0,
        comparison_parameters: item.length > 6 ? item[6] : null,
        matched_childs: item.length > 7 ? item[7] : null
      }));

      console.log('New Items', newItem);
      setIsLoading(false);
      setProgressBarLoad(false);
      try {
        return NewItemAPI.upsertItems(newItem);
      } catch (error) {
        console.log('While creating error', newItem, error);
        return false;
      }
    } else {
      console.log(
        'Not creating because it might be already created',
        itemapidetailsRes.data,
        itemapidetailsRes.data[0].child_item_status,
        itemapidetailsRes.data[0].child_item_status === 'INITIATED'
      );
      setIsLoading(false);
      setProgressBarLoad(false);
    }
  } catch (error) {
    console.log('Child item creation Error', error);
  }
  setIsLoading(false);
  setProgressBarLoad(false);
  setIsFileLoading(false);
  return false;
};
