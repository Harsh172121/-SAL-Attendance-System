/**
 * PostgreSQL connection configured through environment variables.
 * Schema changes are managed separately; connecting never creates or alters tables.
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Keep the backend's existing environment as the fallback while allowing the
// Neon CLI's root .env.local (or .env) to supply DATABASE_URL. dotenv does not
// overwrite values that were already provided by the process or backend/.env.
[
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env.local'),
  path.resolve(__dirname, '../../.env')
].forEach((envPath) => dotenv.config({ path: envPath }));

const connectionString = process.env.DATABASE_URL;
const pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
};

const sequelize = connectionString
  ? new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false,
    pool
  })
  : new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      dialect: 'postgres',
      logging: false,
      pool
    }
  );

const validateDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    let parsedUrl;
    try {
      parsedUrl = new URL(process.env.DATABASE_URL);
    } catch {
      throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
    }

    if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
      throw new Error('DATABASE_URL must use the PostgreSQL protocol');
    }

    return;
  }

  const missing = ['DB_NAME', 'DB_USER', 'DB_PASSWORD']
    .filter((key) => process.env[key] === undefined);

  if (missing.length > 0) {
    throw new Error(`Missing required PostgreSQL configuration: ${missing.join(', ')}`);
  }

  const port = Number(process.env.DB_PORT || 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535');
  }
};

const connectDB = async () => {
  try {
    validateDatabaseConfig();
    await sequelize.authenticate();
    const host = process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).hostname
      : process.env.DB_HOST || 'localhost';
    console.log(`✅ PostgreSQL connected: ${host}`);
  } catch (error) {
    // Do not print connection strings or credential values.
    console.error(`❌ PostgreSQL connection failed (${error.code || error.name || 'Error'})`);
    throw error;
  }
};

module.exports.sequelize = sequelize;
module.exports.connectDB = connectDB;
