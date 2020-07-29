const express = require("express");
const router = express.Router();
const ChangeTracking = require("../../models/ChangeTracking");
const User = require("../../models/User");
const auth = require("../../middleware/auth");

router.put("/:id", auth, (req, res) => {
  const saveObject = {
    userAccess: req.body.userAccessId
    ///make sure the savObject in change tracking saves the userAccess ID for each member
  };

  req.body.users.newUsers.forEach(x => {
    User.findByIdAndUpdate(x.id, saveObject)
      .then(() => {
        const changeTracking = new ChangeTracking({
          client: "5e9bf7816d706508dcdd4b53",
          update: saveObject,
          model: "User",
          updateType: "Update",
          updatedObject: x.id, ///change this to the specific user
          updatedBy: req.body.user
        });
        changeTracking.save().catch(error => console.log(error));
        //res.json({ success: true });
      })
      .catch(err => console.log(err));
  });

  const saveObject2 = {
    userAccess: null
    ///make sure the savObject in change tracking saves the userAccess ID for each member
  };

  req.body.users.removedUsers.forEach(x => {
    User.findByIdAndUpdate(x.id, saveObject2)
      .then(() => {
        const changeTracking = new ChangeTracking({
          client: "5e9bf7816d706508dcdd4b53",
          update: saveObject,
          model: "User",
          updateType: "Update",
          updatedObject: x.id, ///change this to the specific user
          updatedBy: req.body.user
        });
        changeTracking.save().catch(error => console.log(error));
        //res.json({ success: true });
      })
      .catch(err => console.log(err));
  });

  /* User.findByIdAndUpdate(req.params.id, saveObject)
    .then(() => {
      const changeTracking = new ChangeTracking({
        client: "5e9bf7816d706508dcdd4b53",
        update: saveObject,
        model: "UserAccessType",
        updateType: "Update",
        updatedObject: req.params.id,///change this to the specific user
        updatedBy: req.body.user
      });
      changeTracking.save().catch(error => console.log(error));
      res.json({ success: true });
    })
    .catch(err => res.status(404).json({ success: false }));*/
});

module.exports = router;
