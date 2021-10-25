const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const Controller = require('../../controller/criteriaUpload.controller');

router.use(auth);
router.use(checkAccess);

router.get("/", Controller.get);

router.post("/", Controller.upsert);

router.get("/internaUseProductConfiguration", Controller.getInternaUseProductConfiguration);

module.exports = router;
