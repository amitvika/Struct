const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const checkAccess = require('../../middleware/checkAccess');
const Controller = require('../../controller/criteriaUpload.controller');

router.get('/', Controller.get);

router.use(auth);
router.use(checkAccess);

router.post('/', Controller.upsert);

module.exports = router;
