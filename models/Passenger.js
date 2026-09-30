'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Passenger = sequelize.define('Passenger', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), defaultValue: null },
  mobile: { type: DataTypes.STRING(20), allowNull: false },
  aadhar: { type: DataTypes.STRING(20), defaultValue: null },
  address: { type: DataTypes.TEXT, defaultValue: null },
  city: { type: DataTypes.STRING(100), defaultValue: null },
  sex: { type: DataTypes.ENUM('Male', 'Female', 'Other'), defaultValue: null },
  date_of_birth: { type: DataTypes.DATEONLY, defaultValue: null },
  photo: { type: DataTypes.STRING(255), defaultValue: null },
  block_status: { type: DataTypes.ENUM('Block', 'Unblock'), defaultValue: 'Unblock' },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
  total_bookings: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_spent: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  deleted_at: { type: DataTypes.DATE, defaultValue: null },
}, {
  tableName: 'passengers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
});

module.exports = Passenger;
