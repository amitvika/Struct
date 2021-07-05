const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const AutoscalingController = require('../../controller/autoscaling.controller');

router.use(auth);
router.use(checkAccess);

router.get("/", AutoscalingController.get);

router.post("/", AutoscalingController.upsert);

router.put("/:id/approve", AutoscalingController.approveItemForAutoscaling);

// router.get("/items-in-production", AutoscalingController.itemInAutoscaling);


module.exports = router;
