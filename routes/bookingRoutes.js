'use strict';

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/cancelled', bookingController.cancelledList);
router.get('/', bookingController.list);
router.get('/:id', bookingController.show);
router.post('/', bookingController.create);
router.patch('/:id/cancel', bookingController.cancel);
router.patch('/:id/payment', bookingController.updatePayment);
module.exports = router;
