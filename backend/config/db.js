/**
 * PostgreSQL connection configured through environment variables.
 * Schema changes are managed separately; connecting never creates or alters tables.
 */

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const validateDatabaseConfig = () => {
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
    console.log(`✅ PostgreSQL connected: ${process.env.DB_HOST || 'localhost'}`);
  } catch (error) {
    // Do not print connection strings or credential values.
    console.error(`❌ PostgreSQL connection failed (${error.code || error.name || 'Error'})`);
    throw error;
  }
};

module.exports = { sequelize, connectDB };
