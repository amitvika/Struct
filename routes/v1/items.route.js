const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const ItemsController = require('../../controller/items.controller');

router.use(auth);
router.get("/", ItemsController.get);

router.get("/all", ItemsController.getAll);

router.post("/", ItemsController.create);

router.put("/:id", ItemsController.update);

router.get("/:id", ItemsController.getOne);

router.delete("/:id", ItemsController.delete);

router.get("/:id/geomtery", ItemsController.itemGeometry);

router.put("/:id/geomtery", ItemsController.updateItemGeometry);

router.delete("/:id/geomtery", ItemsController.removeItemGeometry);


module.exports = router;
