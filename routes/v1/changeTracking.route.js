const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const ChangeTrackingController = require('../../controller/changeTracking.controller');

router.use(auth);
router.get("/", ChangeTrackingController.get);

module.exports = router;
