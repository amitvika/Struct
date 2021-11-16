import { get } from 'lodash';
import { getAFileFromStore } from '@monostruct/common/api/fileUpload.api';
import NewItemAPI from '@monostruct/common/api/items.api';

export const getGDTParentItems = async ({ fileUUId, fileGDT, parentId }) => {
  try {
    const treeRes = await getAFileFromStore(`${fileUUId}/${fileGDT}`, 'tree');

    const treeData = get(treeRes, 'data', [])
      .filter((item) => item.p === 1)
      .map((item) => ({
        name: item.n,
        parent_id: parentId,
        is_child_item: true
      }));

    await NewItemAPI.upsertItems(treeData);
  } catch (error) {
    console.log('=====>>>>error', error);
  }
};
