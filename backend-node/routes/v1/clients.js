const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const { hasPermissionForClientEdit } = require('../../middleware/hasPermission')
const ClientController = require('../../controller/client.controller');

router.use(auth);
router.use(checkAccess);

router.get("/", ClientController.get);

router.get("/:id", ClientController.getOne);

router.post("/", hasPermissionForClientEdit, ClientController.create);

router.delete("/:id", hasPermissionForClientEdit, ClientController.delete);

router.put("/:id", hasPermissionForClientEdit, ClientController.update);

router.patch("/:id/configure-domain", hasPermissionForClientEdit, ClientController.createPersonalSubdomain);

module.exports = router;
