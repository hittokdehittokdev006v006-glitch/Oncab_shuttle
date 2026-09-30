'use strict';

const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/expiring-documents', vehicleController.expiringDocuments);
router.get('/bus-types', vehicleController.listBusTypes);
router.get('/', vehicleController.list);
router.get('/:id', vehicleController.show);
router.post('/', vehicleController.create);
router.put('/:id', vehicleController.update);
router.delete('/:id', vehicleController.destroy);
router.post('/:id/documents', vehicleController.addDocument);
module.exports = router;
