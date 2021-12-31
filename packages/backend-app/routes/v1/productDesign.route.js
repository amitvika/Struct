const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const checkAccess = require('../../middleware/checkAccess');
const ProductDesignController = require('../../controller/productDesign.controller');

router.get('/', ProductDesignController.get);

router.use(auth);
router.use(checkAccess);

router.post('/', ProductDesignController.upsert);

module.exports = router;
