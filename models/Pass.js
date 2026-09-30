'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pass = sequelize.define('Pass', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  passenger_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  route_id: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  pass_code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  pass_type: { type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annual'), allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  valid_from: { type: DataTypes.DATEONLY, allowNull: false },
  valid_until: { type: DataTypes.DATEONLY, allowNull: false },
  trips_allowed: { type: DataTypes.INTEGER, defaultValue: null },
  trips_used: { type: DataTypes.INTEGER, defaultValue: 0 },
  payment_status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
  transaction_id: { type: DataTypes.STRING(100), defaultValue: null },
  status: { type: DataTypes.ENUM('Active', 'Expired', 'Suspended', 'Cancelled'), defaultValue: 'Active' },
  notes: { type: DataTypes.TEXT, defaultValue: null },
  deleted_at: { type: DataTypes.DATE, defaultValue: null },
}, {
  tableName: 'passes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
});

module.exports = Pass;
