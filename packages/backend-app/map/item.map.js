const isArray = require('lodash/isArray');
const get = require('lodash/get');
const moment = require('moment');

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

    return myitems;
  } else {
    return [];
  }
};

exports.mapItem = async (item = {}) => {
  if (item === null) {
    return {};
  }

  let file_url = item.fileStore
    ? (item.fileUUId ? item.fileUUId + '/' : '') + item.fileStore
    : undefined;

  const itemName = (item) => {
    return item.name
      ? item.name + '0' == item.fileStore
        ? item.filePartName
          ? item.filePartName
          : item.name
        : item.name
      : item.filePartName
      ? item.filePartName
      : 'Untitled-2';
  };
  let myobject = {
    ...item.toObject(),
    id: item._id,
    name: itemName(item),
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
    child_item_status: item.child_item_status,
    direct_parent_id: item.parent_id || item._id,
    origin_parent_id: item.parent_id || item._id,
    created_at: moment(get(item, 'createdAt')).format(
      'MMMM Do YYYY, h:mm:ss a'
    ),
    updated_at: moment(get(item, 'updatedAt')).format('MMMM Do YYYY, h:mm:ss a')
  };
  // console.log('Getting one item', myobject, item.name);
  return myobject;
};
