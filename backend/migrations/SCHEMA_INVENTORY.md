# SAL Attendance PostgreSQL schema inventory

This inventory describes the 14 application tables in
`001_initial_schema.js`. It was compared with the Sequelize v6 models,
associations, the read-only PostgreSQL catalog audit, raw SQL, and the prior
schema helper. The verified target was `sal_attendance` as `sal_user`, schema
`public`; at audit time, `public` contained no tables, records, constraints,
indexes, or enum types.

## Conventions

- `id` columns are PostgreSQL `SERIAL` integer primary keys (Sequelize
  `INTEGER` with `autoIncrement: true`).
- All model timestamps are `TIMESTAMP WITH TIME ZONE NOT NULL`; Sequelize sets
  them on writes. `classrooms` has no timestamps.
- Sequelize attribute names preserve their case in PostgreSQL. The explicit
  exception is `classrooms.classroomNumber`, stored as `classroom_number`.
- Unless a foreign key below states otherwise, it is `ON DELETE NO ACTION ON
  UPDATE CASCADE`.
- `NULL` is the default unless a column is marked `NOT NULL`.
- Defaults shown here are database defaults; model validations are enforced by
  Sequelize and are not additional database `CHECK` constraints.

## Tables and columns

### `admins`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password` | VARCHAR(255) | NOT NULL |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT `'admin'` |
| `isActive` | BOOLEAN | DEFAULT `true` |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

### `teachers`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `employeeId` | VARCHAR(50) | NOT NULL, UNIQUE |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password` | VARCHAR(255) | NOT NULL |
| `phone` | VARCHAR(20) | NULL |
| `department` | VARCHAR(100) | NOT NULL |
| `departments` | JSONB | NULL |
| `qualification` | VARCHAR(100) | NULL |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT `'teacher'` |
| `priority` | ENUM | NOT NULL, DEFAULT `'FACULTY'` |
| `isActive` | BOOLEAN | DEFAULT `true` |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

`priority` values: `ADMIN`, `PRINCIPAL`, `HOD`, `FACULTY`,
`CLASS_COORDINATOR`. The column comment from the Sequelize model is retained:
“Teacher designation/priority level within the institution”.

### `classes`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `name` | VARCHAR(50) | NOT NULL |
| `department` | VARCHAR(100) | NOT NULL |
| `semester` | INTEGER | NOT NULL |
| `academicYear` | VARCHAR(20) | DEFAULT `'2025-26'` |
| `classCoordinatorId` | INTEGER | NULL, FK to `teachers.id`, ON DELETE SET NULL |
| `isActive` | BOOLEAN | DEFAULT `true` |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

### `batches`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `name` | VARCHAR(20) | NOT NULL |
| `classId` | INTEGER | NOT NULL, FK to `classes.id`, ON DELETE CASCADE |
| `description` | VARCHAR(200) | NULL |
| `isActive` | BOOLEAN | DEFAULT `true` |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

### `students`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `enrollmentNo` | VARCHAR(50) | NOT NULL, UNIQUE |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password` | VARCHAR(255) | NOT NULL |
| `phone` | VARCHAR(20) | NULL |
| `classId` | INTEGER | NOT NULL, FK to `classes.id`, ON DELETE CASCADE |
| `batchId` | INTEGER | NULL, FK to `batches.id`, ON DELETE SET NULL |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT `'student'` |
| `isActive` | BOOLEAN | DEFAULT `true` |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

### `subjects`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `code` | VARCHAR(20) | NOT NULL, UNIQUE |
| `name` | VARCHAR(100) | NOT NULL |
| `type` | ENUM | NOT NULL |
| `theoryFacultyId` | INTEGER | NULL, FK to `teachers.id`, ON DELETE SET NULL |
| `labFacultyId` | INTEGER | NULL, FK to `teachers.id`, ON DELETE SET NULL |
| `theoryFacultyIds` | JSONB | NULL |
| `labFacultyIds` | JSONB | NULL |
| `credits` | INTEGER | DEFAULT `3` |
| `isActive` | BOOLEAN | DEFAULT `true` |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

`type` values: `theory`, `lab`, `theory+lab`.

### `classrooms`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `classroom_number` | INTEGER | NOT NULL, UNIQUE |

### `subject_classes`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `subjectId` | INTEGER | primary key component, FK to `subjects.id`, ON DELETE CASCADE |
| `classId` | INTEGER | primary key component, FK to `classes.id`, ON DELETE CASCADE |

The composite primary key prevents duplicate subject/class assignments. Its
leading `subjectId` key supports subject lookups; one additional index supports
reverse lookups by `classId`.

### `lecture_slots`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `facultyId` | INTEGER | NOT NULL, FK to `teachers.id` |
| `subjectId` | INTEGER | NOT NULL, FK to `subjects.id` |
| `classId` | INTEGER | NOT NULL, FK to `classes.id` |
| `batchId` | INTEGER | NULL, FK to `batches.id`, ON DELETE SET NULL |
| `classroomId` | INTEGER | NULL, FK to `classrooms.id`, ON DELETE SET NULL |
| `type` | ENUM | NOT NULL |
| `dayOfWeek` | ENUM | NOT NULL |
| `startTime`, `endTime` | TIME | NOT NULL |
| `isActive` | BOOLEAN | DEFAULT `true` |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

`type` values: `theory`, `lab`. `dayOfWeek` values: `Monday`, `Tuesday`,
`Wednesday`, `Thursday`, `Friday`, `Saturday`.

### `attendances`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `studentId` | INTEGER | NOT NULL, FK to `students.id` |
| `subjectId` | INTEGER | NOT NULL, FK to `subjects.id` |
| `classId` | INTEGER | NOT NULL, FK to `classes.id` |
| `batchId` | INTEGER | NULL, FK to `batches.id`, ON DELETE SET NULL |
| `date` | DATE | NOT NULL |
| `type` | ENUM | NOT NULL: `theory`, `lab` |
| `status` | ENUM | NOT NULL: `present`, `absent`, `leave` |
| `markedBy` | INTEGER | NOT NULL, FK to `teachers.id` |
| `slotId` | INTEGER | NULL, FK to `lecture_slots.id`, ON DELETE SET NULL |
| `remarks` | VARCHAR(200) | NULL |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

### `leave_applications`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `studentId` | INTEGER | NOT NULL, FK to `students.id` |
| `classId` | INTEGER | NOT NULL, FK to `classes.id` |
| `fromDate`, `toDate` | DATE | NOT NULL |
| `totalDays` | INTEGER | NOT NULL |
| `reason` | TEXT | NOT NULL |
| `sentTo` | ENUM | NOT NULL, DEFAULT `'BOTH'` |
| `coordinatorId` | INTEGER | NULL, FK to `teachers.id`, ON DELETE SET NULL |
| `hodId` | INTEGER | NULL, FK to `teachers.id`, ON DELETE SET NULL |
| `status` | ENUM | NOT NULL, DEFAULT `'pending'` |
| `approvedBy` | INTEGER | NULL, FK to `teachers.id`, ON DELETE SET NULL |
| `approvedDate`, `decisionDate` | TIMESTAMP WITH TIME ZONE | NULL |
| `adminNote` | TEXT | NULL |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

`sentTo` values: `CLASS_COORDINATOR`, `HOD`, `BOTH`. `status` values:
`pending`, `approved`, `rejected`.

### `proxy_requests`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `slotId` | INTEGER | NOT NULL, FK to `lecture_slots.id` |
| `subjectId` | INTEGER | NOT NULL, FK to `subjects.id` |
| `classId` | INTEGER | NOT NULL, FK to `classes.id` |
| `originalFacultyId`, `proxyFacultyId`, `hodId` | INTEGER | NOT NULL, each FK to `teachers.id` |
| `status` | ENUM | NOT NULL, DEFAULT `'pending'` |
| `reason` | VARCHAR(500) | NULL |
| `date` | DATE | NOT NULL |
| `activeRequestKey` | SMALLINT | NULL, DEFAULT `1` |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

`status` values: `pending`, `approved`, `rejected`. Rejected requests may set
`activeRequestKey` to NULL, preserving the existing unique-active-request rule.

### `proxy_assignments`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `slotId` | INTEGER | NOT NULL, FK to `lecture_slots.id` |
| `date` | DATE | NOT NULL |
| `originalFacultyId`, `proxyFacultyId` | INTEGER | NOT NULL, each FK to `teachers.id` |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

### `lecture_logs`

| Column | PostgreSQL type | Nullability / default |
|---|---|---|
| `id` | SERIAL | primary key |
| `slotId` | INTEGER | NOT NULL, FK to `lecture_slots.id` |
| `date` | DATE | NOT NULL |
| `topicCovered` | VARCHAR(500) | NOT NULL |
| `markedBy` | INTEGER | NOT NULL, FK to `teachers.id` |
| `createdAt`, `updatedAt` | TIMESTAMP WITH TIME ZONE | NOT NULL |

## Indexes and unique rules

- Single-column UNIQUE: `admins.email`; `teachers.employeeId`, `teachers.email`;
  `students.enrollmentNo`, `students.email`; `subjects.code`;
  `classrooms.classroom_number`.
- `classes`: unique `(name, department, semester)`;
  `classCoordinatorId` index.
- `batches`: unique `(name, classId)`.
- `students`: `(classId, batchId)`.
- `subjects`: `theoryFacultyId`, `labFacultyId`.
- `subject_classes`: composite primary key `(subjectId, classId)` and
  `classId` reverse lookup index.
- `attendances`: `(studentId, subjectId, classId, date)`; `(subjectId, date)`;
  `(studentId, subjectId)`; `(classId, date)`; `(slotId, date)`;
  `(studentId, subjectId, date)`; `(studentId, subjectId, slotId)`; unique
  `(slotId, studentId, date)`.
- `lecture_slots`: `(facultyId, dayOfWeek, startTime, endTime, isActive)`;
  `classId`; `subjectId`.
- `leave_applications`: `studentId`, `classId`, `sentTo`, `coordinatorId`,
  `hodId`, `status`, `(fromDate, toDate)`.
- `proxy_requests`: `(hodId, status)`, `(proxyFacultyId, status)`,
  `(slotId, date)`, and unique `(slotId, date, activeRequestKey)`.
- `proxy_assignments`: unique `(slotId, date)` and
  `(proxyFacultyId, date, slotId)`.
- `lecture_logs`: unique `(slotId, date)`.

Redundant indexes from the former automatic schema helper are consolidated with
model indexes. In particular, the `subject_classes` primary key covers the
leading `subjectId`, and the full lecture-slot/proxy-assignment indexes cover
their shorter prefixes.

## Supporting table

The migration runner maintains `schema_migrations(name VARCHAR(255) PRIMARY
KEY, executedAt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP)`.
It is migration metadata, not an application data table.
