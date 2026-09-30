'use strict';

const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', driverController.list);
router.get('/:id', driverController.show);
router.post('/', driverController.create);
router.put('/:id', driverController.update);
router.delete('/:id', driverController.destroy);
router.patch('/:id/status', driverController.updateStatus);
module.exports = router;
