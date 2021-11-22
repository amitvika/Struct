import { get } from 'lodash';
import {
  getAFileFromStore,
  getHierarchySplitFiles
} from '@monostruct/common/api/fileUpload.api';
import { STATEPROPS } from '@monostruct/common/gltf/Tree/utils';

import NewItemAPI from '@monostruct/common/api/items.api';

export const createChildItems = async ({
  fileUUId,
  pathFileName,
  parentId
}) => {
  try {
    const treeRes = await getAFileFromStore(
      `${fileUUId}/${pathFileName}`,
      'progress'
    );

    const childFiles = get(treeRes, 'data.childfiles', []);
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
