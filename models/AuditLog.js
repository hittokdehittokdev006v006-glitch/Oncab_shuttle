'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  user_type: { type: DataTypes.STRING(50), defaultValue: null },
  user_name: { type: DataTypes.STRING(100), defaultValue: null },
  action: { type: DataTypes.STRING(100), allowNull: false },
  module: { type: DataTypes.STRING(50), allowNull: false },
  entity_type: { type: DataTypes.STRING(100), defaultValue: null },
  entity_id: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  old_values: { type: DataTypes.JSON, defaultValue: null },
  new_values: { type: DataTypes.JSON, defaultValue: null },
  ip_address: { type: DataTypes.STRING(45), defaultValue: null },
  user_agent: { type: DataTypes.TEXT, defaultValue: null },
  description: { type: DataTypes.TEXT, defaultValue: null },
  status: { type: DataTypes.ENUM('success', 'failed'), defaultValue: 'success' },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = AuditLog;
