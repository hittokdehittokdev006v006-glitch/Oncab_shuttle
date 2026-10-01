'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusRoute = sequelize.define('BusRoute', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  route_name: { type: DataTypes.STRING(255), allowNull: false },
  route_code: { type: DataTypes.STRING(50), allowNull: false },
  origin_city: { type: DataTypes.STRING(255), allowNull: false },
  destination_city: { type: DataTypes.STRING(255), allowNull: false },
  route_stops: { type: DataTypes.JSON, defaultValue: null },
  total_distance: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  estimated_duration: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
  description: { type: DataTypes.TEXT, defaultValue: null },
}, {
  tableName: 'bus_routes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = BusRoute;