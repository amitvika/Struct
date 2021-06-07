const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const { hasPermissionForClientEdit } = require('../../middleware/hasPermission')
const FactoryController = require('../../controller/factory.controller');

router.use(auth);
router.use(checkAccess);

router.get("/", FactoryController.get);

router.post("/", hasPermissionForClientEdit, FactoryController.upsert);

module.exports = router;
