'use strict';

const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', routeController.list);
router.get('/:id', routeController.show);
router.post('/', routeController.create);
router.put('/:id', routeController.update);
router.delete('/:id', routeController.destroy);
router.post('/:id/stops', routeController.addStop);
router.put('/:id/stops/:stopId', routeController.updateStop);
router.delete('/:id/stops/:stopId', routeController.deleteStop);
module.exports = router;
