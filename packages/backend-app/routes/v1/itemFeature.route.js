const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ItemsFeature = require('../../controller/itemFeature.controller');

router.post('/', ItemsFeature.getItemFeatures);

module.exports = router;
