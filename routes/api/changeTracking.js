const express = require("express");
const router = express.Router();
const ChangeTracking = require("../../models/ChangeTracking");
//const auth = require("../../middleware/auth");

router.get("/", (req, res) => {
  ChangeTracking.find()
    .populate("updatedBy", "name")
    .populate("client", "name")
    .sort({ date: -1 })
    .then(clients => {
      res.json(clients);
    })
    .catch(error => console.log(error));
});
module.exports = router;
