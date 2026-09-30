'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleDocument = sequelize.define('VehicleDocument', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  vehicle_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  doc_type: {
    type: DataTypes.ENUM('insurance', 'fitness', 'pollution', 'registration', 'permit', 'other'),
    allowNull: false
  },
  doc_number: { type: DataTypes.STRING(100), defaultValue: null },
  doc_img: { type: DataTypes.STRING(255), defaultValue: null },
  issue_date: { type: DataTypes.DATEONLY, defaultValue: null },
  expiry_date: { type: DataTypes.DATEONLY, defaultValue: null },
  status: { type: DataTypes.ENUM('Valid', 'Expired', 'Expiring Soon'), defaultValue: 'Valid' },
  notes: { type: DataTypes.TEXT, defaultValue: null },
}, {
  tableName: 'vehicle_documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [{ unique: true, fields: ['vehicle_id', 'doc_type'], name: 'vehicle_documents_vehicle_type_unique' }],
});

module.exports = VehicleDocument;
