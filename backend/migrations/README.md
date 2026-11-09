# PostgreSQL migration workflow

The backend no longer creates or alters application tables when it starts. Add
reviewed migration files as `NNN_description.js`, each exporting an
`up({ sequelize, queryInterface, transaction })` function. The runner applies
them in filename order and records successful files in `schema_migrations` in
the same transaction as each migration. Add follow-up migrations for later
schema changes; do not edit a migration after it has been applied.

Run migrations only after the PostgreSQL database has been created separately,
connection variables are configured, and the migration has been reviewed:

```sh
npm run db:migrate
```

The initial PostgreSQL schema follows the current models and associations. It
does not establish the deployed MySQL schema or the data a later data migration
must preserve. Before migrating any source data, verify the source schema and
relationships, especially:

- whether the deployed subject/class join table is `SubjectClasses` or
  `subject_classes` and how its rows map to the current `SubjectClass` model;
- whether `subjects.classId` or `subjects.classIds` still exist and contain
  data (the old startup helper dropped them automatically);
- existing enum values, indexes, foreign-key actions, and timestamp types;
- all other tables and columns that exist in deployed databases but are not
  represented by the current Sequelize models.

`001_initial_schema.js` defines the verified empty PostgreSQL baseline, with a
read-only preflight that refuses to run on a different database/user/schema or
when conflicting relations or enum types already exist. Its `down` operation
refuses rollback if any application table contains rows. Use `npm run db:rollback` only before
application data has been added. For later migrations, prefer a new corrective
migration over rollback after data exists.

The current model definitions preserve the declared teacher priority, leave
recipient and proxy status values, camelCase attributes, integer identity IDs,
JSON data behavior, timestamps, unique indexes, and associations. PostgreSQL
schema and JSON type choices in the applied baseline follow the current
application models. Before moving existing MySQL data, compare the source
schema, enum values, and JSON contents against this baseline and plan a separate
data migration. That data migration must not be combined with schema
migrations.
