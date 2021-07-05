const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const TaskController = require('../../controller/task.controller');

router.use(auth);
router.use(checkAccess);

router.get("/", TaskController.get);

router.post("/", TaskController.upsert);

module.exports = router;
