import { get } from 'lodash';
import { getAFileFromStore } from '@monostruct/common/api/fileUpload.api';
import NewItemAPI from '@monostruct/common/api/items.api';

const getFilenameAndExtension = (path) => {
  var filename = path.split('/').pop();
  return {
    fileName: filename.substr(0, filename.lastIndexOf('.')),
    extension: filename.substr(filename.lastIndexOf('.') + 1)
  };
};

export const createChildItems = async ({
  fileUUId,
  pathFileName,
  parentId
}) => {
  try {
    //const { fileName, extension } = getFilenameAndExtension(pathFileName);

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
  } catch (error) {
    console.log('=====>>>>error', error);
  }
};
