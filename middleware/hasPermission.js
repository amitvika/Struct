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

module.exports = {
  hasPermissionForPGView,
  hasPermissionForPGEdit
}