'use strict';

/** Trigram indexes accelerate PostgreSQL ILIKE '%term%' student searches. */
const up = async ({ sequelize, transaction }) => {
  await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm', { transaction });
  await sequelize.query(
    'CREATE INDEX IF NOT EXISTS idx_students_name_trgm ON students USING GIN (name gin_trgm_ops)',
    { transaction }
  );
  await sequelize.query(
    'CREATE INDEX IF NOT EXISTS idx_students_enrollment_trgm ON students USING GIN ("enrollmentNo" gin_trgm_ops)',
    { transaction }
  );
  await sequelize.query(
    'CREATE INDEX IF NOT EXISTS idx_students_email_trgm ON students USING GIN (email gin_trgm_ops)',
    { transaction }
  );
};

const down = async ({ sequelize, transaction }) => {
  await sequelize.query('DROP INDEX IF EXISTS idx_students_email_trgm', { transaction });
  await sequelize.query('DROP INDEX IF EXISTS idx_students_enrollment_trgm', { transaction });
  await sequelize.query('DROP INDEX IF EXISTS idx_students_name_trgm', { transaction });
};

module.exports = { up, down };
