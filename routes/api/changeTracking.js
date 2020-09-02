const express = require("express");
const router = express.Router();
const ChangeTracking = require("../../models/ChangeTracking");
const c = require("config");
//const auth = require("../../middleware/auth");

router.get("/", (req, res) => {
  // ChangeTracking.find()
    // .populate("updatedBy", "name")
    // .populate("client", "name")
    // .sort({ date: -1 })
    // .then(clients => {
      console.log('-----clients--->>>', [])
      res.json([]);
    // })
    // .catch(error => {
    //   console.log('====',error)
    //   res.status(500).send(error)
    // });
});
module.exports = router;
