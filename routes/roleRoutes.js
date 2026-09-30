'use strict';

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);

router.get('/permissions', roleController.listPermissions);
router.get('/', roleController.listRoles);
router.post('/', requireRole('admin'), roleController.createRole);
router.put('/:id', requireRole('admin'), roleController.updateRole);
router.delete('/:id', requireRole('admin'), roleController.deleteRole);
router.put('/:id/permissions', requireRole('admin'), roleController.assignPermissions);

module.exports = router;
