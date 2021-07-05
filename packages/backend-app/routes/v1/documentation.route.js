const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const DocumentationController = require('../../controller/documentation.controller');

router.use(auth);
router.use(checkAccess);

router.get("/", DocumentationController.get);

router.post("/", DocumentationController.upsert);

module.exports = router;
