'use strict';

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const createValidation = [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  body('role_id').isInt({ min: 1 }).withMessage('Role required'),
  handleValidationErrors,
];

const updateValidation = [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  handleValidationErrors,
];

router.use(authenticate);

router.get('/', requireRole('admin'), userController.list);
router.get('/:id', requireRole('admin'), userController.show);
router.post('/', requireRole('admin'), createValidation, userController.create);
router.put('/:id', requireRole('admin'), updateValidation, userController.update);
router.delete('/:id', requireRole('admin'), userController.destroy);
router.patch('/:id/toggle-status', requireRole('admin'), userController.toggleStatus);

module.exports = router;
