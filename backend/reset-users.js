/**
 * Retired legacy utility.
 *
 * The previous script disabled foreign-key enforcement, deleted unrelated
 * records, and made the required students.classId column nullable. It cannot
 * be safely translated into a data-preserving PostgreSQL operation.
 */
console.error(
  'reset-users.js is retired. It made destructive schema and data changes; use reviewed migrations and a purpose-built admin workflow instead.'
);
process.exitCode = 1;
