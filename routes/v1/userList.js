const express = require("express");
const router = express.Router();
const User = require("../../models/User");

router.get("/", (req, res) => {
  User.find()
    .populate("userAccess")
    .sort({ date: -1 }) //sorts descending
    .then(clients => {
      res.json(clients);
    });
});

module.exports = router;
