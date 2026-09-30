'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING(100), allowNull: false },
  notifiable_type: { type: DataTypes.STRING(100), defaultValue: null },
  notifiable_id: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  title: { type: DataTypes.STRING(200), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  data: { type: DataTypes.JSON, defaultValue: null },
  target_type: { type: DataTypes.ENUM('all', 'admin', 'operator', 'passenger', 'driver'), defaultValue: 'all' },
  target_id: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: null },
  read_at: { type: DataTypes.DATE, defaultValue: null },
  sent_at: { type: DataTypes.DATE, defaultValue: null },
  channel: { type: DataTypes.ENUM('in_app', 'email', 'sms', 'push'), defaultValue: 'in_app' },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Notification;
