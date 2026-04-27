/* global require, module */
/**
 * Proxy assignment model.
 * Effective faculty override for a slot on a specific date.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProxyAssignment = sequelize.define('ProxyAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lecture_slots',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  originalFacultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    }
  },
  proxyFacultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'id'
    }
  }
}, {
  tableName: 'proxy_assignments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['slotId', 'date'],
      name: 'unique_proxy_slot_date'
    },
    { fields: ['proxyFacultyId', 'date'] }
  ]
});

module.exports = ProxyAssignment;

