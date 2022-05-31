const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const DuplicateItemController = require('../../controller/duplicateItems.controller');

router.use(auth);

router.get("/", DuplicateItemController.get);

module.exports = router;
