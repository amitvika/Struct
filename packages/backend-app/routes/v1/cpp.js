const express = require("express");
const router = express.Router();
const ProcessGroup = require("../../models/ProcessGroup");
const ChangeTracking = require("../../models/ChangeTracking.model");
const auth = require("../../middleware/auth");
// const testAddon = require("../../build/Release/testaddon.node");
////console.log("addon", testAddon);
//console.log("hello ", testAddon.hello());

// router.get("/", (req, res) => {
//   res.json(testAddon.hello());
// });

module.exports = router;
