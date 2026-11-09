/** Run reviewed, forward-only PostgreSQL migrations in filename order. */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Schema changes use Neon’s direct connection. Runtime traffic continues to use
// the pooled DATABASE_URL.
if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}

const { DataTypes, QueryTypes } = require('sequelize');
const { sequelize, connectDB } = require('../config/db');
const { verifyMigrationTarget } = require('./target');

const MIGRATION_FILE = /^\d{3}_[a-z0-9_-]+\.js$/;
const LEDGER_TABLE = 'schema_migrations';

const getMigrationFiles = () => fs.readdirSync(__dirname)
  .filter((file) => MIGRATION_FILE.test(file))
  .sort();

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  return tables.some((table) => (
    (typeof table === 'string' ? table : table.tableName || table.name) === tableName
  ));
};

const ensureMigrationLedger = async (queryInterface) => {
  if (await tableExists(queryInterface, LEDGER_TABLE)) {
    return;
  }

  await queryInterface.createTable(LEDGER_TABLE, {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    executedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  });
};

const runMigrations = async (direction) => {
  const files = getMigrationFiles();
  if (!['up', 'down'].includes(direction)) {
    throw new Error('Use `up` to apply migrations or `down` to roll back the latest migration.');
  }
  if (direction === 'up' && files.length === 0) {
    throw new Error('No versioned migration files exist yet. Add and review a migration before running this command.');
  }

  await connectDB();
  const queryInterface = sequelize.getQueryInterface();
  await verifyMigrationTarget(sequelize, { allowNeon: direction === 'up' });

  if (direction === 'down' && !(await tableExists(queryInterface, LEDGER_TABLE))) {
    console.log('No migration ledger exists; nothing to roll back.');
    return;
  }

  const ledgerExists = await tableExists(queryInterface, LEDGER_TABLE);
  const appliedRows = ledgerExists
    ? await sequelize.query(
      direction === 'up'
        ? `SELECT name FROM ${queryInterface.queryGenerator.quoteTable(LEDGER_TABLE)}`
        : `SELECT name FROM ${queryInterface.queryGenerator.quoteTable(LEDGER_TABLE)} ORDER BY "executedAt" DESC, name DESC LIMIT 1`,
      { type: QueryTypes.SELECT }
    )
    : [];
  const applied = new Set(appliedRows.map((row) => row.name));

  const pending = direction === 'up'
    ? files.filter((file) => !applied.has(file))
    : appliedRows.map((row) => row.name);

  if (direction === 'up' && pending.length === 0) {
    console.log('Database schema is up to date.');
    return;
  }

  if (direction === 'up') {
    for (const file of pending) {
      const migrationPath = path.join(__dirname, file);
      if (!fs.existsSync(migrationPath)) {
        throw new Error(`Migration file ${file} is missing from this checkout.`);
      }
      const migration = require(migrationPath);
      if (typeof migration.preflight === 'function') {
        await migration.preflight({ sequelize, queryInterface });
      }
    }

    // Create the metadata table only after all pending migrations pass their
    // read-only preflights.
    if (!ledgerExists) {
      await ensureMigrationLedger(queryInterface);
    }
  }

  for (const file of pending) {
    const migrationPath = path.join(__dirname, file);
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Applied migration file ${file} is missing from this checkout.`);
    }
    const migration = require(migrationPath);
    const method = migration[direction];
    if (typeof method !== 'function') {
      throw new Error(`Migration ${file} must export a ${direction}({ sequelize, queryInterface, transaction }) function.`);
    }

    await sequelize.transaction(async (transaction) => {
      await method({ sequelize, queryInterface, transaction });
      if (direction === 'up') {
        await sequelize.query(
          `INSERT INTO ${queryInterface.queryGenerator.quoteTable(LEDGER_TABLE)} (name, "executedAt") VALUES (:name, CURRENT_TIMESTAMP)`,
          { replacements: { name: file }, transaction }
        );
      } else {
        await sequelize.query(
          `DELETE FROM ${queryInterface.queryGenerator.quoteTable(LEDGER_TABLE)} WHERE name = :name`,
          { replacements: { name: file }, transaction }
        );
      }
    });

    console.log(`✅ ${direction === 'up' ? 'Applied' : 'Rolled back'} migration ${file}`);
    if (direction === 'down') {
      break;
    }
  }
};

runMigrations(process.argv[2] || 'up')
  .catch((error) => {
    console.error(`❌ Migration failed (${error.code || error.name || 'Error'}). Check the migration file and PostgreSQL server logs.`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
