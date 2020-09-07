const express = require('express');
const router = express.Router();
const v1Routes = require('./v1/index');

router.use('/api', v1Routes);

module.exports = router;