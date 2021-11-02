const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const VendorController = require('../../controller/vendor.controller');

router.use(auth);
router.get('/', VendorController.get);
router.put('/', VendorController.upsert);

router.get('/:id', VendorController.getOne);

router.post('/', VendorController.create);

router.put('/:id', VendorController.update);

router.delete('/:id', VendorController.delete);

module.exports = router;
