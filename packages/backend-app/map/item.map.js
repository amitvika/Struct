const isArray = require('lodash/isArray');
const get = require('lodash/get');
const { resourcePathURL } = require('@monostruct/common/api/common');

exports.mapItems = (data) => {
  if (isArray(data)) {
    return data.map((item, index) => {
      return this.mapItem(item);
    });
  } else {
    return [];
  }
};

exports.mapItem = (item = {}) => {
  if (item === null) {
    return {};
  }

  return {
    ...item.toObject(),
    id: item._id,
    name: item.name,
    source: get(item, 'vendorId.name', 'STRUCT'),
    file_url: item.fileStore
      ? (item.fileUUId
          ? (resourcePathURL || '') + item.fileUUId + '/'
          : resourcePathURL || '') +
        item.fileStore +
        '.png'
      : undefined,
    created_by_name: get(item, 'created_by.name', ''),
    created_by: get(item, 'created_by._id', ''),
    updated_by_name: get(item, 'updated_by.name', ''),
    updated_by: get(item, 'updated_by._id', ''),
    is_archived: item.is_archived
  };
};
