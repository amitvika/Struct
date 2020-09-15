const mongoose = require('mongoose');
const UserModel = mongoose.model('User');

async function checkAccess(req, res, next) {

  const user = await UserModel
    .findOne({ _is: req.user._id })
    .populate("userAccess");
  
    if (user && user.userAccess) {
    req.access = user.userAccess.access
    next();
  } else {
    res
      .status(403)
      .send({ message: 'Not Authorized for User' });
  }

}

module.exports = checkAccess;

