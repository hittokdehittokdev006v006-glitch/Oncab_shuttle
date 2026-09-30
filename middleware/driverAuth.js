'use strict';

const jwt = require('jsonwebtoken');
const { Driver, DriverDetail } = require('../models');

/**
 * Middleware to authenticate Driver App users via JWT Bearer Token
 */
const authenticateDriver = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Authentication token required',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Check if token payload has driver_id or user id
    const driverId = decoded.driver_id || decoded.id;

    if (!driverId) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Invalid driver token payload',
      });
    }

    const driver = await Driver.findByPk(driverId, {
      include: [{ model: DriverDetail, as: 'details' }],
    });

    if (!driver) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Driver account not found',
      });
    }

    if (driver.block_status === 'Block') {
      return res.status(403).json({
        success: false,
        status: 403,
        message: 'Driver account is blocked. Please contact support.',
      });
    }

    req.driver = driver;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Driver session expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Invalid authorization token',
      });
    }
    next(err);
  }
};

module.exports = { authenticateDriver };
