const express = require('express');
const router = express.Router();
const path = require('path');

const Upload = require('../../middleware/fileUpload');
const ItemController = require('../../controller/items.controller');
const LoadMaterial = require('../../controller/loadMaterial.controller');

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
router.use("/assemblyProcess", require("./assemblyProcess.route"));

router.post('/step-file', Upload.uploadSingleFile(), ItemController.load_cadfile);
router.get('/stl-file/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, `../../uploads/step/${req.params.fileName}`));
});

router.get('/load-material', LoadMaterial.load);

module.exports = router;