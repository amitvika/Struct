const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const ItemsController = require('../../controller/items.controller');

router.use(auth);
router.get("/", ItemsController.get);

router.post("/", ItemsController.create);

router.put("/:id", ItemsController.update);

router.delete("/:id", ItemsController.delete);

module.exports = router;
