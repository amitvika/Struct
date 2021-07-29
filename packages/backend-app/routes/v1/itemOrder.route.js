const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const ItemOrderController = require('../../controller/itemOrder.controller');

router.use(auth);

router.get("/", ItemOrderController.get);

router.post("/", ItemOrderController.upsert);


module.exports = router;
