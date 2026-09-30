'use strict';

const express = require('express');
const router = express.Router();
const driverAppController = require('../controllers/driverAppController');
const { authenticateDriver } = require('../middleware/driverAuth');

// ── 1. AUTHENTICATION (PUBLIC) ──────────────────────────────
router.post('/auth/login-otp', driverAppController.sendOtp);
router.post('/auth/verify-otp', driverAppController.verifyOtp);

// Legacy / alias authentication endpoints
router.post('/login-otp', driverAppController.sendOtp);
router.post('/verify-otp', driverAppController.verifyOtp);

// ── PROTECTED DRIVER APP ROUTES ──────────────────────────────
router.use(authenticateDriver);

// Profile & Duty Status
router.get('/profile', driverAppController.getProfile);
router.put('/profile', driverAppController.updateProfile);
router.patch('/duty-status', driverAppController.toggleDutyStatus);

// Assigned Trips & Schedule
router.get('/assigned-trips', driverAppController.getAssignedTrips);
router.get('/my-assignments', driverAppController.getAssignedTrips); // Alias
router.post('/my-assignments', driverAppController.getAssignedTrips); // Alias for POST
router.get('/trips/:id', driverAppController.getTripDetails);
router.get('/trips/:id/manifest', driverAppController.getPassengerManifest);

// Trip Action Operations
router.post('/trips/:id/start', driverAppController.startTrip);
router.post('/start-trip', driverAppController.startTrip); // Legacy endpoint format

router.post('/trips/:id/complete', driverAppController.completeTrip);
router.post('/complete-trip', driverAppController.completeTrip); // Legacy endpoint format

// Ticket Boarding Verification Flow
router.post('/scan-boarding-pass', driverAppController.scanBoardingPass);
router.post('/confirm-boarding', driverAppController.confirmBoarding);
router.post('/manual-verify-boarding', driverAppController.manualVerifyBoarding);

// GPS Live Location
router.post('/location/update', driverAppController.updateLocation);

// History & Earnings
router.get('/history', driverAppController.getTripHistory);
router.get('/earnings', driverAppController.getEarningsSummary);

module.exports = router;
