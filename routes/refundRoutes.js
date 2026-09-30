'use strict';

const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refundController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/failed', refundController.failedList);
router.get('/completed', refundController.completedList);
router.get('/', refundController.list);
router.patch('/:id/process', refundController.process);
router.patch('/:id/retry', refundController.retry);
router.patch('/:id/mark-failed', refundController.markFailed);
module.exports = router;
