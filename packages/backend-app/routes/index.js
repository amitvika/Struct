const express = require('express');
const router = express.Router();
const v1Routes = require('./v1/index');
const commonRoutes = require('./common.route')

router.use('/api', v1Routes);
router.use('/', commonRoutes)

module.exports = router;