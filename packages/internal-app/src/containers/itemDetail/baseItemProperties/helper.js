import { get } from 'lodash';
import {
  getAFileFromStore,
  getHierarchySplitFiles
} from '@monostruct/common/api/fileUpload.api';
import { pollFunction } from '@monostruct/common/gltf/Tree/utils';

import NewItemAPI from '@monostruct/common/api/items.api';

export const createChildItems = async ({
  fileUUId,
  pathFileName,
  parentId
}) => {
  try {
    const datafile = `${fileUUId}/${pathFileName}`;
    let fetchStatus = () => getAFileFromStore(datafile, 'progress');
    let validateStatus = (result) => {
      return !result.data.childwritten;
    };
    let percentFunction = (result) => result.data.childwritten;
    // console.log('Entering poll', datagdt, dataload);
    await pollFunction(
      fetchStatus,
      validateStatus,
      30000,
      null,
      percentFunction,
      null,
      null
    );
    const childRes = await getAFileFromStore(datafile, 'progress');
    const childFiles = get(childRes, 'data.childfiles', []);
    const newItem = childFiles.map((item) => ({
      fileUUId: item[0],
      name: item[1],
      fileName: `Media/${item[0]}/${item[1]}.step`,
      fileStore: `${item[1]}0`,
      parent_id: parentId,
      is_child_item: true,
      filePartName: item[2]
    }));

    await NewItemAPI.upsertItems(newItem);
  } catch (error) {}
};
