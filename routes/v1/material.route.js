const express = require("express");
const router = express.Router();

const LoadMaterial = require('../../controller/material.controller');

router.get('/', LoadMaterial.getMaterials);
router.get('/get-hierarchy/:material', LoadMaterial.getHierarchy);

router.get('/load-material', LoadMaterial.load);
router.get('/load-material-hierarchy', LoadMaterial.loadHierarchy);

router.get('/category', LoadMaterial.getMaterialCategories)

module.exports = router;