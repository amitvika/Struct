const express = require("express");
const router = express.Router();
const UserAccessType = require("../../models/UserAccessType");
const ChangeTracking = require("../../models/ChangeTracking");
const auth = require("../../middleware/auth");

router.put("/:id", auth, (req, res) => {
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
});

router.get("/:id", (req, res) => {
  UserAccessType.findById(req.params.id)
    .sort({ date: -1 }) //sorts descending
    .then(clients => {
      res.json(clients);
    });
});

module.exports = router;
