/* global require, module */
/**
 * Proxy assignment model.
 * Effective faculty override for a slot on a specific date.
 */

const { DataTypes } = require('sequelize');

function defineProxyAssignment(sequelize) {
  if (!sequelize || typeof sequelize.define !== 'function') {
    throw new TypeError('defineProxyAssignment requires a Sequelize instance');
  }

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
      {
        name: 'idx_proxy_assignment_proxy_date',
        fields: ['proxyFacultyId', 'date', 'slotId']
      }
    ]
  });

  return ProxyAssignment;
}

module.exports = defineProxyAssignment;

