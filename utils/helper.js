const ObjectId = require('mongoose').Types.ObjectId;

exports.extractIds = (object) => {
  let permisibleIds = [];
  Object.keys(object).forEach(key => {
    if (ObjectId.isValid(key) && String(new ObjectId(key)) === key && object[key]) {
      permisibleIds.push(key);
    }
  });

  return permisibleIds;
}