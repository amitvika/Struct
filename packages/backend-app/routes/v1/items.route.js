const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ItemsController = require('../../controller/items.controller');
const ItemOrderController = require('../../controller/itemOrder.controller');

router.use(auth);
router.get('/', ItemsController.get);

router.get('/all', ItemsController.getAll);

router.post('/upsert', ItemsController.upsert);

router.put('/:id', ItemsController.update);

router.get('/order', ItemOrderController.get);

router.post('/order', ItemOrderController.upsert);

router.delete('/remove-child/:id', ItemsController.removeChildItems);

module.exports = router;
