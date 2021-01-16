const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const ItemsController = require('../../controller/items.controller');

router.use(auth);
router.get("/", ItemsController.get);

router.get("/filter", ItemsController.filterItems)

router.get("/all", ItemsController.getAll);

router.post("/", ItemsController.create);

router.put("/:id", ItemsController.update);

router.get("/:id", ItemsController.getOne);

router.delete("/:id", ItemsController.delete);

router.get("/:id/geomtery", ItemsController.itemGeometry);

router.get("/:id/three-model", ItemsController.itemDetailThreejs);

router.delete("/:id/three-model", ItemsController.removeItemDetailThreejs);

module.exports = router;
