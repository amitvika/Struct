const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ItemsController = require('../../controller/items.controller');
const ItemOrderController = require('../../controller/itemOrder.controller');

router.use(auth);
router.get('/', ItemsController.get);

router.get('/all', ItemsController.getAll);

router.post('/', ItemsController.create);

router.post('/upsert', ItemsController.upsert);

router.put('/:id', ItemsController.update);

router.get('/:id', ItemsController.getOne);

router.delete('/:id', ItemsController.delete);

router.get('/:id/geomtery', ItemsController.itemGeometry);

router.get('/:id/three-model', ItemsController.itemDetailThreejs);

router.delete('/:id/three-model', ItemsController.removeItemDetailThreejs);

router.get('/order', ItemOrderController.get);

router.post('/order', ItemOrderController.upsert);

module.exports = router;
