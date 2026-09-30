'use strict';

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/stats', dashboardController.stats);
router.get('/revenue-report', dashboardController.revenueReport);
router.get('/audit-logs', dashboardController.auditLogs);
module.exports = router;
