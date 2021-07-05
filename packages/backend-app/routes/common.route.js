const express = require('express');
const router = express.Router();
const path = require('path');


router.get('/', function (req, res) {
  res.send('Welcome to Struct');
});

router.get('/logo/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, `../uploads/logo/${req.params.fileName}`));
});

router.get('/sign_s3', require('../utils/aws').generate_signed_url);

module.exports = router;