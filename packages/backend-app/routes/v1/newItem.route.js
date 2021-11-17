const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ItemsController = require('../../controller/newItem.controller');

router.use(auth);

router.put('/', ItemsController.upsert);

module.exports = router;
