'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Route = sequelize.define('Route', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  route_name: { type: DataTypes.STRING(150), allowNull: false },
  route_code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  origin_city: { type: DataTypes.STRING(100), allowNull: false },
  destination_city: { type: DataTypes.STRING(100), allowNull: false },
  total_distance: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
  estimated_duration: { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.TEXT, defaultValue: null },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
  deleted_at: { type: DataTypes.DATE, defaultValue: null },
}, {
  tableName: 'routes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
});

module.exports = Route;
