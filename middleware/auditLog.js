'use strict';

const { AuditLog } = require('../models');

/**
 * Audit logging middleware factory
 * Usage: router.post('/users', auditLog('create', 'users'), controller)
 */
const auditLog = (action, module) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      if (res.statusCode < 400) {
        // Log only successful actions
        setImmediate(async () => {
          try {
            await AuditLog.create({
              user_id: req.user?.id || null,
              user_type: req.user?.role?.name || null,
              user_name: req.user?.name || null,
              action,
              module,
              entity_type: req.params?.id ? module : null,
              entity_id: req.params?.id ? parseInt(req.params.id) : (data?.data?.id || null),
              old_values: req._oldValues || null,
              new_values: req.body || null,
              ip_address: req.ip || req.connection?.remoteAddress,
              user_agent: req.headers?.['user-agent'],
              description: `${action} on ${module}`,
              status: 'success',
            });
          } catch (err) {
            console.error('[AuditLog Error]', err.message);
          }
        });
      }
      return originalJson(data);
    };
    next();
  };
};

/**
 * Manual audit log function for use inside controllers
 */
const logAction = async ({ userId, userType, userName, action, module, entityType, entityId, oldValues, newValues, ipAddress, description, status = 'success' }) => {
  try {
    await AuditLog.create({
      user_id: userId,
      user_type: userType,
      user_name: userName,
      action,
      module,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      description,
      status,
    });
  } catch (err) {
    console.error('[logAction Error]', err.message);
  }
};

module.exports = { auditLog, logAction };
