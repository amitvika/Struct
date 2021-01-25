const express = require("express");
const router = express.Router();
const auth = require("@middleware/auth");
const AssemblyManufactureController = require('../../controller/assemblyManufacture.controller');

router.use(auth);
router.get("/item/:itemId", AssemblyManufactureController.getByItem);

router.post("/", AssemblyManufactureController.upsert);

module.exports = router;
