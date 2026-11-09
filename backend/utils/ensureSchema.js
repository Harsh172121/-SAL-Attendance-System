/**
 * Read-only PostgreSQL schema inspection retained for the legacy check-schema
 * utility. Application startup must not mutate schema; use reviewed migrations.
 */
const ensureSchema = async (sequelize) => {
  if (sequelize.getDialect() !== 'postgres') {
    throw new Error('Schema inspection requires the PostgreSQL Sequelize dialect');
  }

  const tables = await sequelize.getQueryInterface().showAllTables();
  const tableNames = tables.map((table) => (
    typeof table === 'string' ? table : table.tableName || table.name
  ));

  console.log(`PostgreSQL schema contains ${tableNames.length} tables.`);
  return tableNames;
};

module.exports = { ensureSchema };
