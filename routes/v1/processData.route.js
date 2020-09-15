const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const ProcessDataController = require('../../controller/processData.controller');
const { hasPermissionForProcessDataEdit } = require('../../middleware/hasPermission')

router.use(auth);

router.get("/:id", ProcessDataController.get);

router.post("/", checkAccess, hasPermissionForProcessDataEdit, ProcessDataController.create);

module.exports = router;
