const ObjectId = require('mongoose').Types.ObjectId;

exports.extractIds = (object) => {
  let permisibleIds = [];
  Object.keys(object).forEach((key) => {
    if (
      ObjectId.isValid(key) &&
      String(new ObjectId(key)) === key &&
      object[key]
    ) {
      permisibleIds.push(key);
    }
  });

  return permisibleIds;
};

exports.getObjectId = (id) => {
  return ObjectId(id);
};

exports.isObjectIdValid = (id) => ObjectId.isValid(id);

exports.createSearchQuery = (queryValue, strFields = []) => {
  let filterQuery = { $or: [] };

  if (this.isObjectIdValid(queryValue)) {
    filterQuery.$or.push({ _id: queryValue });
  }

  strFields.map((field) => {
    filterQuery.$or.push({
      [field]: {
        $regex: new RegExp(`${queryValue}`, 'i')
      }
    });
  });

  return filterQuery;
};
