const UserAccessType = require("../models/UserAccessType");
const ChangeTracking = require("../models/ChangeTracking.model");
const UserModel = require('../models/User');

exports.update = (req, res) => {
  const saveObject = {
    name: req.body.name,
    access: req.body.state
  };
  UserAccessType.findByIdAndUpdate(req.params.id, saveObject)
    .then(() => {
      const changeTracking = new ChangeTracking({
        client: "5e9bf7816d706508dcdd4b53",
        update: saveObject,
        model: "UserAccessType",
        updateType: "Update",
        updatedObject: req.params.id,
        updatedBy: req.body.user
      });
      changeTracking.save().catch(error => console.log(error));
      res.json({ success: true });
    })
    .catch(err => res.status(404).json({ success: false }));
}

exports.getById = (req, res) => {

  UserAccessType.findById(req.params.id)
    .sort({ date: -1 }) //sorts descending
    .then(clients => {
      res.json(clients);
    });
}

exports.get = async (req, res) => {
  const user = await UserModel
    .findOne({ _id: req.user.id })
    .populate("userAccess");

  if (user.userAccess && user.userAccess._id) {
    return res.json(user.userAccess);
  }

  const updatedUser = await UserModel.findByIdAndUpdate(req.user.id,
    { $set: { userAccess: '5e9bf12d4d1e982f1063bf2f' } },
    { new: true });

  if (!updatedUser) {
    return res.status(400).send({ message: 'Error occurred' })
  }

  UserAccessType.findById(updatedUser.userAccess)
    .then(clients => {
      res.json(clients);
    });
}