const express = require("express");
const router = express.Router();
const ProcessGroup = require("../../models/ProcessGroup");
const ChangeTracking = require("../../models/ChangeTracking.model");
const auth = require("../../middleware/auth");

router.get("/:id", (req, res) => {
  ProcessGroup.findById(req.params.id)
    .populate("client")
    .sort({ date: -1 }) //sorts descending
    .then(clients => {
      res.json(clients);
    });
});

module.exports = router;
