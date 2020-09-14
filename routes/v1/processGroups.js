const express = require("express");
const router = express.Router();
const ProcessGroup = require("../../models/ProcessGroup");
const ChangeTracking = require("../../models/ChangeTracking");
const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const { hasPermissionForPGView, hasPermissionForPGEdit } = require('../../middleware/hasPermission')

router.use(auth);
router.use(checkAccess);

router.get("/",
  hasPermissionForPGView,
  (req, res) => {
    ProcessGroup.find()
      .populate("createdBy", "name")
      .populate("client")
      .sort({ date: -1 }) //sorts descending
      .then(clients => {
        res.json(clients);
      });
  });

router.post("/",
  hasPermissionForPGEdit,
  (req, res) => {
    const saveObject = {
      name: req.body.name,
      createdBy: req.body.user,
      client: req.body.client
    };
    const newProcessGroup = new ProcessGroup(saveObject);
    newProcessGroup
      .save()
      .then(item => {
        const changeTracking = new ChangeTracking({
          client: item._id,
          update: saveObject,
          model: "ProcessGroup",
          updateType: "Create",
          updatedObject: item._id,
          updatedBy: req.body.user
        });
        changeTracking.save().catch(error => console.log(error));

        res.json(item);
      })
      .catch(error => console.log(error));
  });

router.delete("/:id",
  hasPermissionForPGEdit,
  (req, res) => {
    /* ProcessGroup.findByIdAndRemove(req.params.id)
      .then(() => res.json({ success: true }))
      .catch(err => res.status(404).json({ success: false }));*/

    ProcessGroup.findById(req.params.id, "deletedAt", function (err, client) {
      console.log(client);
      if (client.deletedAt == null) {
        const saveObject = {
          deletedAt: Date.now()
        };
        ProcessGroup.findByIdAndUpdate(req.params.id, saveObject)
          .then(() => {
            const changeTracking = new ChangeTracking({
              client: req.body.client,
              update: saveObject,
              model: "ProcessGroup",
              updateType: "Delete",
              updatedObject: req.params.id,
              updatedBy: req.body.user
            });
            changeTracking.save().catch(error => console.log(error));

            res.json({ success: true });
          })
          .catch(err => res.status(404).json({ success: false }));
      } else {
        const saveObject = {
          deletedAt: null
        };
        ProcessGroup.findByIdAndUpdate(req.params.id, saveObject)
          .then(() => {
            console.log(req.body);
            const changeTracking = new ChangeTracking({
              client: req.body.client,
              update: saveObject,
              model: "ProcessGroup",
              updateType: "Un-Delete",
              updatedObject: req.params.id,
              updatedBy: req.body.user
            });
            changeTracking.save().catch(error => console.log(error));

            res.json({ success: true });
          })
          .catch(err => res.status(404).json({ success: false }));
      }
    });
  });

router.put("/:id",
  hasPermissionForPGEdit,
  (req, res) => {
    const saveObject = {
      name: req.body.name,
      client: req.body.client
    };
    ProcessGroup.findByIdAndUpdate(req.params.id, saveObject)
      .then(() => {
        const changeTracking = new ChangeTracking({
          client: req.body.client,
          update: saveObject,
          model: "ProcessGroup",
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
