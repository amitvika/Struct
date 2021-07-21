const express = require("express");
const router = express.Router();

const FileHistoryController = require('../../controller/fileHistory.controller');

router.get("/:id", FileHistoryController.get);

module.exports = router;
