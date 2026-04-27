/**
 * SAL Education - Database Configuration
 * 
 * This file handles MySQL connection using Sequelize.
 * VIVA NOTE: Sequelize is an ORM (Object Relational Mapping) library
 * that provides schema validation and easy query building for SQL databases.
 */

const { Sequelize } = require('sequelize');
const { ensureSchema } = require('../utils/ensureSchema');

/**
 * Create Sequelize instance
 * Uses MySQL as the database
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || 'sal_attendance',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

/**
 * Connect to MySQL Database
 * Uses async/await for cleaner error handling
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL Connected: ${process.env.DB_HOST || 'localhost'}`);
    
    // Sync model definitions without destructive alter operations.
    await sequelize.sync();
    await ensureSchema(sequelize);
    console.log('✅ Database tables synced');
  } catch (error) {
    console.error(`❌ MySQL Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = { sequelize, connectDB };
