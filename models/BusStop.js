'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusStop = sequelize.define('BusStop', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  route_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  stop_name: { type: DataTypes.STRING(255), allowNull: false },
  latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: false },
  longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
  stop_sequence: { type: DataTypes.INTEGER, allowNull: false },
  stop_code: { type: DataTypes.STRING(50), allowNull: false },
  address: { type: DataTypes.TEXT, defaultValue: null },
  landmark: { type: DataTypes.STRING(255), defaultValue: null },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
}, {
  tableName: 'bus_stops',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = BusStop;