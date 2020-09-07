const express = require('express');
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/cpp", require("./cpp"));
router.use("/upload", require("./upload"));
router.use("/items", require("./items"));
router.use("/clients", require("./clients"));
router.use("/userAccessTypes", require("./userAccessTypes"));
router.use("/userAccessConfigurations", require("./userAccessConfigurations"));
router.use("/userAccessConfigurationUsers", require("./userAccessConfigurationUsers"));
router.use("/changeTracking", require("./changeTracking"));
router.use("/userList", require("./userList"));
router.use("/processGroups", require("./processGroups"));
router.use("/processGroup", require("./processGroup"));
router.use("/processdata", require("./processdata"));
router.use("/processes", require("./processes"));

module.exports = router;