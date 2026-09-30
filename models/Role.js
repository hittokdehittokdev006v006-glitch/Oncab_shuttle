'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  display_name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: null },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Role;
