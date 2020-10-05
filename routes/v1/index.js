const express = require('express');
const router = express.Router();
const Upload = require('../../middleware/fileUpload');
const ProcessGroupController = require('../../controller/processGroup.controller');

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/cpp", require("./cpp"));
router.use("/upload", require("./upload"));
router.use("/items", require("./items.route"));
router.use("/clients", require("./clients"));
router.use("/userAccessTypes", require("./userAccessTypes"));
router.use("/userAccessConfigurations", require("./userAccessConfigurations"));
router.use("/userAccessConfigurationUsers", require("./userAccessConfigurationUsers"));
router.use("/changeTracking", require("./changeTracking.route"));
router.use("/userList", require("./userList"));
router.use("/processGroups", require("./processGroups"));
router.use("/processGroup", require("./processGroup"));
router.use("/processdata", require("./processData.route"));
router.use("/processes", require("./processes"));
router.use("/vendor", require("./vendors.route"));

router.post('/step-file', Upload.uploadSingleFile(), ProcessGroupController.load_cadfile)

module.exports = router;