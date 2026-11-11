/* global require, module */
/**
 * Proxy request model.
 * Stores faculty proxy requests that are sent directly to the selected
 * proxy faculty member for a decision. The HOD approval step was removed.
 */

const { DataTypes } = require('sequelize');

function defineProxyRequest(sequelize) {
  if (!sequelize || typeof sequelize.define !== 'function') {
    throw new TypeError('defineProxyRequest requires a Sequelize instance');
  }

  const ProxyRequest = sequelize.define('ProxyRequest', {
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
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      }
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
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    activeRequestKey: {
      // PostgreSQL has no TINYINT; this flag only stores 1 or NULL.
      type: DataTypes.SMALLINT,
      allowNull: true,
      defaultValue: 1
    },
    // Null until the selected proxy faculty opens/acknowledges the request.
    // This drives the unread badge and the sidebar notification popup.
    proxyFacultyViewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'proxy_requests',
    timestamps: true,
    indexes: [
      { fields: ['proxyFacultyId', 'status'] },
      { fields: ['proxyFacultyId', 'status', 'proxyFacultyViewedAt'] },
      { fields: ['slotId', 'date'] },
      {
        unique: true,
        fields: ['slotId', 'date', 'activeRequestKey'],
        name: 'unique_active_proxy_request'
      }
    ]
  });

  return ProxyRequest;
}

module.exports = defineProxyRequest;

