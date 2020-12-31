const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const ProcessDataController = require('../../controller/processData.controller');

router.use(auth);

router.get("/:id/all", ProcessDataController.get);

router.get("/:id", ProcessDataController.getOne);

router.post("/", checkAccess, ProcessDataController.create);

router.put("/:id", checkAccess, ProcessDataController.update);

router.delete("/:id", checkAccess, ProcessDataController.delete);

module.exports = router;
