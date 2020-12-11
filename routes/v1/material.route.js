const express = require("express");
const router = express.Router();

const LoadMaterial = require('../../controller/material.controller');

router.get('/', LoadMaterial.getMaterials);

router.get('/load-material', LoadMaterial.load);
router.get('/load-material-hierarchy', LoadMaterial.loadHierarchy);

module.exports = router;