const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');

const { hasPermissionForPGEdit } = require('../../middleware/hasPermission');
const ProcessGroupController = require('../../controller/processGroup.controller');

router.use(auth);
router.use(checkAccess);

router.get("/", ProcessGroupController.get)

router.post("/",
  hasPermissionForPGEdit,
  ProcessGroupController.create
);

router.delete("/:id",
  hasPermissionForPGEdit,
  ProcessGroupController.delete);

router.put("/:id",
  hasPermissionForPGEdit,
  ProcessGroupController.update);

module.exports = router;
