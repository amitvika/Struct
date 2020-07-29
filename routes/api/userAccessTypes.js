const express = require("express");
const router = express.Router();
const UserAccessType = require("../../models/UserAccessType");
const ChangeTracking = require("../../models/ChangeTracking");
const auth = require("../../middleware/auth");

router.get("/", (req, res) => {
  UserAccessType.find()
    .sort({ date: -1 }) //sorts descending
    .then(clients => {
      res.json(clients);
    });
});

router.post("/", auth, (req, res) => {
  const saveObject = {
    name: req.body.name,
    deletedAt: null
  };

  //console.log(req.body.user);
  const newUserAccessType = new UserAccessType(saveObject);
  newUserAccessType
    .save()
    .then(item => {
      ////////////////
      const changeTracking = new ChangeTracking({
        client: "5e9bf7816d706508dcdd4b53",
        update: saveObject,
        model: "UserAccessType",
        updateType: "Create",
        updatedObject: item._id,
        updatedBy: req.body.user
      });
      changeTracking.save().catch(error => console.log(error));
      ///////////////////////
      res.json(item);
    })
    .catch(error => console.log(error));
});

router.delete("/:id", auth, (req, res) => {
  UserAccessType.findById(req.params.id, "deletedAt", function(
    err,
    userAccessType
  ) {
    if (userAccessType.deletedAt == null) {
      const saveObject = {
        deletedAt: Date.now()
      };
      UserAccessType.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: "5e9bf7816d706508dcdd4b53",
            update: saveObject,
            model: "UserAccessType",
            updateType: "Delete",
            updatedObject: req.params.id,
            updatedBy: req.user.id
          });
          changeTracking.save().catch(error => console.log(error));
          res.json({ success: true });
        })
        .catch(err => res.status(404).json({ success: false }));
    } else {
      const saveObject = {
        deletedAt: null
      };
      UserAccessType.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: "5e9bf7816d706508dcdd4b53",
            update: saveObject,
            model: "UserAccessType",
            updateType: "Un-Delete",
            updatedObject: req.params.id,
            updatedBy: req.user.id
          });
          changeTracking.save().catch(error => console.log(error));
          res.json({ success: true });
        })
        .catch(err => res.status(404).json({ success: false }));
    }
  });
});

router.put("/:id", auth, (req, res) => {
  const saveObject = {
    name: req.body.name
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
});

module.exports = router;
