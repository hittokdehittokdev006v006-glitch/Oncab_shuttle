'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  value: { type: DataTypes.TEXT, defaultValue: null },
  type: { type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'text'), defaultValue: 'string' },
  group: { type: DataTypes.STRING(50), defaultValue: 'general' },
  label: { type: DataTypes.STRING(150), defaultValue: null },
  description: { type: DataTypes.TEXT, defaultValue: null },
  is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'system_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = SystemSetting;
