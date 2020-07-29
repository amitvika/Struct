const express = require("express");
const router = express.Router();
const Client = require("../../models/Client");
const ChangeTracking = require("../../models/ChangeTracking");
const auth = require("../../middleware/auth");

router.get("/", (req, res) => {
  Client.find()
    .populate("createdByUserId", "name")
    .sort({ date: -1 }) //sorts descending
    .then(clients => {
      res.json(clients);
    });
});

router.post("/", auth, (req, res) => {
  const saveObject = {
    name: req.body.name,
    createdByUserId: req.body.userId
  };
  const newClient = new Client(saveObject);
  newClient
    .save()
    .then(item => {
      const changeTracking = new ChangeTracking({
        client: item._id,
        update: saveObject,
        model: "Client",
        updateType: "Create",
        updatedObject: item._id,
        updatedBy: req.body.userId
      });
      changeTracking.save().catch(error => console.log(error));

      res.json(item);
    })
    .catch(error => console.log(error));
});

router.delete("/:id", auth, (req, res) => {
  /* Client.findByIdAndRemove(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(404).json({ success: false }));*/

  Client.findById(req.params.id, "deletedAt", function(err, client) {
    console.log(client);
    if (client.deletedAt == null) {
      const saveObject = {
        deletedAt: Date.now()
      };
      Client.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: req.params.id,
            update: saveObject,
            model: "Client",
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
      Client.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: req.params.id,
            update: saveObject,
            model: "Client",
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
  Client.findByIdAndUpdate(req.params.id, saveObject)
    .then(() => {
      const changeTracking = new ChangeTracking({
        client: req.params.id,
        update: saveObject,
        model: "Client",
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
