const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const AssemblyProcessController = require('../../controller/assemblyProcess.controller');

router.use(auth);
router.get("/:assemblyId", AssemblyProcessController.get);

router.get("/all", AssemblyProcessController.getAll);

router.post("/", AssemblyProcessController.create);

// router.put("/:id", AssemblyProcessController.update);

// router.delete("/:id", AssemblyProcessController.delete);

module.exports = router;
