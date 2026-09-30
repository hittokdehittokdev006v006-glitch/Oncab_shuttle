'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const passengerController = require('../controllers/passengerController');
const passController = require('../controllers/passController');
const couponController = require('../controllers/couponController');
const notificationController = require('../controllers/notificationController');
const settingController = require('../controllers/settingController');
const paymentController = require('../controllers/paymentController');

router.use(authenticate);

// Passengers
router.get('/passengers', passengerController.list);
router.get('/passengers/:id', passengerController.show);
router.post('/passengers', passengerController.create);
router.put('/passengers/:id', passengerController.update);
router.delete('/passengers/:id', passengerController.destroy);
router.patch('/passengers/:id/toggle-block', passengerController.toggleBlock);

// Passes
router.get('/passes/expiring', passController.expiringSoon);
router.get('/passes', passController.list);
router.get('/passes/:id', passController.show);
router.post('/passes', passController.create);
router.put('/passes/:id', passController.update);
router.delete('/passes/:id', passController.destroy);

// Coupons
router.post('/coupons/validate', couponController.validate);
router.get('/coupons', couponController.list);
router.get('/coupons/:id', couponController.show);
router.post('/coupons', couponController.create);
router.put('/coupons/:id', couponController.update);
router.delete('/coupons/:id', couponController.destroy);

// Notifications
router.get('/notifications', notificationController.list);
router.post('/notifications', notificationController.send);
router.patch('/notifications/read-all', notificationController.markAllRead);
router.patch('/notifications/:id/read', notificationController.markRead);
router.delete('/notifications/:id', notificationController.destroy);

// System Settings
router.get('/settings', settingController.list);
router.get('/settings/:key', settingController.get);
router.post('/settings', settingController.update);
router.put('/settings/bulk', settingController.bulkUpdate);

// Payments
router.get('/payments', paymentController.list);
router.get('/payments/:id', paymentController.show);

module.exports = router;
