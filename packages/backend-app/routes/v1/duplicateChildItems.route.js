const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const DuplicateChildItemsController = require('../../controller/duplicateChildItems.controller');

router.use(auth);

router.get("/", DuplicateChildItemsController.get);

module.exports = router;
