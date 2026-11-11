'use strict';

const { DataTypes } = require('sequelize');

/**
 * Direct-to-faculty proxy requests.
 *
 * - HOD approval is no longer part of the flow, so hodId becomes nullable.
 * - proxyFacultyViewedAt powers the unread badge and sidebar notification.
 */
const up = async ({ sequelize, queryInterface, transaction }) => {
  await sequelize.query(
    'ALTER TABLE "proxy_requests" ALTER COLUMN "hodId" DROP NOT NULL',
    { transaction }
  );

  await queryInterface.addColumn(
    'proxy_requests',
    'proxyFacultyViewedAt',
    { type: DataTypes.DATE, allowNull: true },
    { transaction }
  );

  await queryInterface.addIndex(
    'proxy_requests',
    ['proxyFacultyId', 'status', 'proxyFacultyViewedAt'],
    {
      name: 'idx_proxy_requests_faculty_status_viewed',
      transaction
    }
  );

  // Existing pending requests become unread for their selected proxy faculty,
  // which lets them surface in the new incoming-request panel immediately.
  await sequelize.query(
    `UPDATE "proxy_requests"
     SET "proxyFacultyViewedAt" = NULL
     WHERE "status" = 'pending'`,
    { transaction }
  );
};

const down = async ({ sequelize, queryInterface, transaction }) => {
  await queryInterface.removeIndex(
    'proxy_requests',
    'idx_proxy_requests_faculty_status_viewed',
    { transaction }
  );

  await queryInterface.removeColumn(
    'proxy_requests',
    'proxyFacultyViewedAt',
    { transaction }
  );

  // Rolling back to the HOD flow cannot preserve rows that have no HOD owner.
  await sequelize.query(
    'DELETE FROM "proxy_requests" WHERE "hodId" IS NULL',
    { transaction }
  );

  await sequelize.query(
    'ALTER TABLE "proxy_requests" ALTER COLUMN "hodId" SET NOT NULL',
    { transaction }
  );
};

module.exports = { up, down };
