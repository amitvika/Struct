const isArray = require('lodash/isArray');
const get = require('lodash/get');
/*
const {
  resourcePathURL,
  resourcePathS3URL,
  isFileExistingInServer,
  getExistingPathFromServer
} = require('@monostruct/common/api/fileUpload.api');
*/
exports.mapItems = async (data) => {
  if (isArray(data)) {
    let myitems = [];
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      if (item) {
        try {
          let myItem = await this.mapItem(item);
          // console.log('Map Items', myItem);
          myitems.push(myItem);
        } catch (error) {
          console.log('Error', error, item);
        }
      }
    }
    //console.log('my items array', myitems);
    return myitems;
    /* let myitems = await data.map(async (item, index) => {
      
      console.log('Map Items', myItem);
      return await myItem;
    });
    console.log('my items array', myitems);
    return await myitems; */
  } else {
    return [];
  }
};

exports.mapItem = async (item = {}) => {
  if (item === null) {
    return {};
  }
  //console.log(resourcePathURL,"Resource path",item.fileStore);

  let file_url = item.fileStore
    ? (item.fileUUId ? item.fileUUId + '/' : '') + item.fileStore
    : undefined;

  // if (file_url) {
  //   let isFileExists = await isFileExistingInServer(file_url);
  //   if (!isFileExists) {
  //     file_url = item.fileStore
  //       ? (item.fileUUId
  //           ? (resourcePathS3URL || '') + item.fileUUId + '/'
  //           : resourcePathS3URL || '') +
  //         item.fileStore +
  //         '.png'
  //       : undefined;
  //   } else {
  //   }
  // }
  let myobject = {
    ...item.toObject(),
    id: item._id,
    name: item.name,
    source: get(item, 'vendorId.name', 'STRUCT'),
    file_url: file_url,
    created_by_name: get(item, 'created_by.name', ''),
    created_by: get(item, 'created_by._id', ''),
    updated_by_name: get(item, 'updated_by.name', ''),
    updated_by: get(item, 'updated_by._id', ''),
    is_archived: item.is_archived,
    assemblyType: item.multiAssembly
      ? 'Multi-Item Assembly'
      : 'Single Item Part',
    child_item_created: item.child_item_status === 'COMPLETED' ? 'Yes' : 'No',
    direct_parent_id: item.parent_id,
    origin_parent_id: item.parent_id
  };
  // console.log('Getting one item', myobject, item.name);
  return myobject;
};
