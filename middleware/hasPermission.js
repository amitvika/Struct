const ObjectId = require('mongoose').Types.ObjectId;

const hasPermissionForPGView = (req, res, next) => {
  const access = req.access
  if (access.PGOA_1_V || access.PGOA_3_V) {
    next()
  }
  else {
    return res
      .status(403)
      .send({ message: 'View Access Not Authorized for User.' })
  }
}

const hasPermissionForPGEdit = (req, res, next) => {
  const access = req.access
  if (access.PGOA_1_E || access.PGOA_3_E) {
    next()
  }
  else {
    return res
      .status(403)
      .send({ message: 'Edit Access Not Authorized for User. Configurations Not Saved' })
  }
}


const hasPermissionForClientView = (req, res, next) => {
  const access = req.access;

  if (access.COA_1_V || access.COA_3_V) {
    req.permisibleIds = [];
    next()
  }
  else {
    const permisibleIds = idsWithPermission(access);
    if (permisibleIds.length > 0) {
      req.permisibleIds = permisibleIds;
      next();
    } else {
      return res
        .status(403)
        .send({ message: 'View Access Not Authorized for User.' })
    }
  }
}

const hasPermissionForClientEdit = (req, res, next) => {
  const access = req.access
  if (access.COA_1_E || access.COA_3_E) {
    next()
  }
  else {
    return res
      .status(403)
      .send({ message: 'Edit Access Not Authorized for User. Configurations Not Saved' })
  }
}

const idsWithPermission = (access) => {
  let permisibleIds = [];
  Object.keys(access).forEach(key => {
    if (ObjectId.isValid(key) && String(new ObjectId(key)) === key && access[key]) {
      permisibleIds.push(key);
    }
  });

  return permisibleIds;
}

const hasPermissionForProcessDataEdit = (req, res, next) => {
  const access = req.access
  if (access.COA_1_E || access.COA_2_E || access.COA_3_E ||
    access.COA_4_E || access.COA_5_E || access.COA_6_E) {
    next()
  }
  else {
    return res
      .status(403)
      .send({ message: 'Permission error' })
  }
}

const hasPermissionForAccessConfigUserEdit = (req, res, next) => {
  const access = req.access
  if (access.OA_1_E ) {
    next()
  }
  else {
    return res
      .status(403)
      .send({ message: 'Permission error' })
  }
}



module.exports = {
  hasPermissionForPGView,
  hasPermissionForPGEdit,
  hasPermissionForClientView,
  hasPermissionForClientEdit,
  hasPermissionForProcessDataEdit,
  hasPermissionForAccessConfigUserEdit
}