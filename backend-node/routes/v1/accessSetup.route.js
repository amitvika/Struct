const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const TeamTaskController = require('../../controller/accessSetup.controller');

router.use(auth);
router.use(checkAccess);

router.get("/", TeamTaskController.get);

router.post("/", TeamTaskController.upsert);

module.exports = router;
