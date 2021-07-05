const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const UserAccessTypeController = require('../../controller/userAccessTypes.controller');

router.use(auth)

router.get("/", UserAccessTypeController.get);

router.post("/", UserAccessTypeController.create);


router.delete("/:id", UserAccessTypeController.delete);

router.put("/:id", UserAccessTypeController.update);

module.exports = router;
