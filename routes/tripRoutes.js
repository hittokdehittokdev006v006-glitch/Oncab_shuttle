'use strict';

const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', tripController.list);
router.get('/:id', tripController.show);
router.post('/', tripController.create);
router.put('/:id', tripController.update);
router.delete('/:id', tripController.destroy);
router.patch('/:id/status', tripController.updateStatus);
router.patch('/:id/assign-driver', tripController.assignDriver);
router.patch('/:id/assign-vehicle', tripController.assignVehicle);
module.exports = router;
