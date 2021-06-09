const express = require("express");
const router = express.Router();

const auth = require("@middleware/auth");
const UserAccessConfigController = require('../../controller/userAccessConfig.controller');

router.use(auth);
router.put("/:id", UserAccessConfigController.update);

router.get('/', UserAccessConfigController.get)
router.get("/:id", UserAccessConfigController.getById);

module.exports = router;
