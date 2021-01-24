const User = require("@model/User");

exports.get = (req, res) => {
  User.findById(req.user.id)
    .populate("userAccess")
    .select("-password")
    .then(user => res.json(user));
}