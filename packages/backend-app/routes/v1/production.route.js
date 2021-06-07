const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const ProductionController = require('../../controller/production.controller');

router.use(auth);
router.use(checkAccess);

router.get("/", ProductionController.get);

router.post("/", ProductionController.upsert);

router.put("/:id/approve", ProductionController.approveItemForProduction);

router.get("/items-in-production", ProductionController.itemInProduction);


module.exports = router;
