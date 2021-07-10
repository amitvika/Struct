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

router.get('/download/:file', function (req, res) {
    let fileName = '';
    if (req.params.file === 'criteria') {
        fileName = `Criteria_Load_Template_Example.xlsx`
    }
    else if (req.params.file === 'hierarchy') {
        fileName = `Hierarchy_Load_Template_Example.xlsx`
    }
    const file = path.join(__dirname, `../downloads/${fileName}`);
    res.download(file);
});

module.exports = router;