'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusType = sequelize.define('BusType', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  total_seats: { type: DataTypes.INTEGER, defaultValue: 0 },
  seat_rows: { type: DataTypes.INTEGER, defaultValue: 0 },
  seat_columns: { type: DataTypes.INTEGER, defaultValue: 0 },
  seat_type: { type: DataTypes.ENUM('seater', 'sleeper', 'semi-sleeper'), defaultValue: 'seater' },
  has_ac: { type: DataTypes.BOOLEAN, defaultValue: false },
  has_wifi: { type: DataTypes.BOOLEAN, defaultValue: false },
  amenities: { type: DataTypes.JSON, defaultValue: null },
  description: { type: DataTypes.TEXT, defaultValue: null },
  image: { type: DataTypes.STRING(255), defaultValue: null },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
}, {
  tableName: 'bus_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = BusType;
