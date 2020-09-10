const mongoose = require('mongoose');
const UserModel = mongoose.model('')

async function checkAccess(req, res, next) {

  const user = await UserModel
    .findOne({ _is: req.user._id })
    .populate("userAccess");

    console.log('---', user)
    if(user && user.userAccess){
      next()
    }
}

module.exports = auth;

