'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  display_name: { type: DataTypes.STRING(150), allowNull: false },
  module: { type: DataTypes.STRING(50), allowNull: false },
  action: { type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'manage'), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: null },
}, {
  tableName: 'permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Permission;
