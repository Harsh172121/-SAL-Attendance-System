'use strict';

const { QueryTypes } = require('sequelize');

const LOCAL_TARGET = {
  database: 'sal_attendance',
  connected_user: 'sal_user',
  schema: 'public'
};

const getExpectedTarget = ({ allowNeon = false } = {}) => {
  if (!allowNeon || !process.env.DATABASE_URL || !process.env.NEON_BRANCH) {
    return LOCAL_TARGET;
  }

  let connectionUrl;
  try {
    connectionUrl = new URL(process.env.DATABASE_URL);
  } catch {
    throw new Error('Neon migrations require a valid DATABASE_URL.');
  }

  if (
    !['postgres:', 'postgresql:'].includes(connectionUrl.protocol) ||
    !connectionUrl.hostname.endsWith('.neon.tech')
  ) {
    throw new Error('Neon migrations require a PostgreSQL URL hosted by Neon.');
  }

  const database = decodeURIComponent(connectionUrl.pathname.replace(/^\/+/, ''));
  const connected_user = decodeURIComponent(connectionUrl.username);
  if (!database || !connected_user) {
    throw new Error('Neon DATABASE_URL must identify a database and user.');
  }

  return { database, connected_user, schema: 'public' };
};

const verifyMigrationTarget = async (sequelize, { allowNeon = false, transaction } = {}) => {
  const rows = await sequelize.query(
    'SELECT current_database() AS database, current_user AS connected_user, current_schema() AS schema',
    { type: QueryTypes.SELECT, transaction }
  );
  const actual = rows[0];
  const expected = getExpectedTarget({ allowNeon });

  if (
    actual.database !== expected.database ||
    actual.connected_user !== expected.connected_user ||
    actual.schema !== expected.schema
  ) {
    throw new Error(
      `Migrations are restricted to ${expected.database} as ${expected.connected_user} in ${expected.schema}.`
    );
  }

  return actual;
};

module.exports = { verifyMigrationTarget };
