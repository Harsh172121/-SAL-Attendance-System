'use strict';

const { DataTypes, QueryTypes } = require('sequelize');
const { verifyMigrationTarget } = require('./target');

const applicationTables = [
  'admins',
  'teachers',
  'classes',
  'batches',
  'students',
  'subjects',
  'classrooms',
  'subject_classes',
  'lecture_slots',
  'attendances',
  'leave_applications',
  'proxy_requests',
  'proxy_assignments',
  'lecture_logs'
];

const creationOrder = applicationTables;
const dropOrder = [...creationOrder].reverse();

const timestampColumns = () => ({
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false }
});

const idColumn = () => ({
  type: DataTypes.INTEGER,
  allowNull: false,
  primaryKey: true,
  autoIncrement: true
});

const foreignKey = (table, allowNull, onDelete = 'NO ACTION') => ({
  type: DataTypes.INTEGER,
  allowNull,
  references: { model: table, key: 'id' },
  onDelete,
  onUpdate: 'CASCADE'
});

const create = (queryInterface, table, columns, transaction, options = {}) => (
  queryInterface.createTable(table, columns, { ...options, transaction })
);

const addIndex = (queryInterface, table, fields, transaction, name, unique = false) => (
  queryInterface.addIndex(table, fields, { name, unique, transaction })
);

const preflight = async ({ sequelize, queryInterface, transaction }) => {
  await verifyMigrationTarget(sequelize, { allowNeon: true, transaction });

  const relations = await sequelize.query(
    `SELECT relation.relname AS name, relation.relkind AS kind
     FROM pg_catalog.pg_class AS relation
     JOIN pg_catalog.pg_namespace AS namespace ON namespace.oid = relation.relnamespace
     WHERE namespace.nspname = 'public'
       AND relation.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
     ORDER BY relation.relname`,
    { type: QueryTypes.SELECT, transaction }
  );
  const unexpected = relations.filter(({ name }) => name !== 'schema_migrations');

  if (unexpected.length > 0) {
    const names = unexpected.map(({ name, kind }) => `${name} (kind ${kind})`);
    throw new Error(`Initial schema migration requires an empty application schema; found existing relation(s): ${names.join(', ')}`);
  }

  const enumTypes = await sequelize.query(
    `SELECT type.typname AS name
     FROM pg_catalog.pg_type AS type
     JOIN pg_catalog.pg_namespace AS namespace ON namespace.oid = type.typnamespace
     WHERE namespace.nspname = 'public' AND type.typtype = 'e'
     ORDER BY type.typname`,
    { type: QueryTypes.SELECT, transaction }
  );

  if (enumTypes.length > 0) {
    throw new Error(`Initial schema migration requires no existing PostgreSQL enum types; found: ${enumTypes.map(({ name }) => name).join(', ')}`);
  }
};

const up = async ({ sequelize, queryInterface, transaction }) => {
  await preflight({ sequelize, queryInterface, transaction });

  await create(queryInterface, 'admins', {
    id: idColumn(),
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'admin' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'teachers', {
    id: idColumn(),
    employeeId: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    department: { type: DataTypes.STRING(100), allowNull: false },
    departments: { type: DataTypes.JSONB, allowNull: true },
    qualification: { type: DataTypes.STRING(100), allowNull: true },
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'teacher' },
    priority: {
      type: DataTypes.ENUM('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'CLASS_COORDINATOR'),
      allowNull: false,
      defaultValue: 'FACULTY',
      comment: 'Teacher designation/priority level within the institution'
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'classes', {
    id: idColumn(),
    name: { type: DataTypes.STRING(50), allowNull: false },
    department: { type: DataTypes.STRING(100), allowNull: false },
    semester: { type: DataTypes.INTEGER, allowNull: false },
    academicYear: { type: DataTypes.STRING(20), defaultValue: '2025-26' },
    classCoordinatorId: foreignKey('teachers', true, 'SET NULL'),
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'batches', {
    id: idColumn(),
    name: { type: DataTypes.STRING(20), allowNull: false },
    classId: foreignKey('classes', false, 'CASCADE'),
    description: { type: DataTypes.STRING(200), allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'students', {
    id: idColumn(),
    enrollmentNo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    classId: foreignKey('classes', false, 'CASCADE'),
    batchId: foreignKey('batches', true, 'SET NULL'),
    role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'student' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'subjects', {
    id: idColumn(),
    code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: { type: DataTypes.ENUM('theory', 'lab', 'theory+lab'), allowNull: false },
    theoryFacultyId: foreignKey('teachers', true, 'SET NULL'),
    labFacultyId: foreignKey('teachers', true, 'SET NULL'),
    theoryFacultyIds: { type: DataTypes.JSONB, allowNull: true },
    labFacultyIds: { type: DataTypes.JSONB, allowNull: true },
    credits: { type: DataTypes.INTEGER, defaultValue: 3 },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'classrooms', {
    id: idColumn(),
    classroom_number: { type: DataTypes.INTEGER, allowNull: false, unique: true }
  }, transaction);

  await create(queryInterface, 'subject_classes', {
    subjectId: { ...foreignKey('subjects', false, 'CASCADE'), primaryKey: true },
    classId: { ...foreignKey('classes', false, 'CASCADE'), primaryKey: true }
  }, transaction);

  await create(queryInterface, 'lecture_slots', {
    id: idColumn(),
    facultyId: foreignKey('teachers', false),
    subjectId: foreignKey('subjects', false),
    classId: foreignKey('classes', false),
    batchId: foreignKey('batches', true, 'SET NULL'),
    classroomId: foreignKey('classrooms', true, 'SET NULL'),
    type: { type: DataTypes.ENUM('theory', 'lab'), allowNull: false },
    dayOfWeek: {
      type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
      allowNull: false
    },
    startTime: { type: DataTypes.TIME, allowNull: false },
    endTime: { type: DataTypes.TIME, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'attendances', {
    id: idColumn(),
    studentId: foreignKey('students', false),
    subjectId: foreignKey('subjects', false),
    classId: foreignKey('classes', false),
    batchId: foreignKey('batches', true, 'SET NULL'),
    date: { type: DataTypes.DATEONLY, allowNull: false },
    type: { type: DataTypes.ENUM('theory', 'lab'), allowNull: false },
    status: { type: DataTypes.ENUM('present', 'absent', 'leave'), allowNull: false },
    markedBy: foreignKey('teachers', false),
    slotId: foreignKey('lecture_slots', true, 'SET NULL'),
    remarks: { type: DataTypes.STRING(200), allowNull: true },
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'leave_applications', {
    id: idColumn(),
    studentId: foreignKey('students', false),
    classId: foreignKey('classes', false),
    fromDate: { type: DataTypes.DATEONLY, allowNull: false },
    toDate: { type: DataTypes.DATEONLY, allowNull: false },
    totalDays: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    sentTo: {
      type: DataTypes.ENUM('CLASS_COORDINATOR', 'HOD', 'BOTH'),
      allowNull: false,
      defaultValue: 'BOTH'
    },
    coordinatorId: foreignKey('teachers', true, 'SET NULL'),
    hodId: foreignKey('teachers', true, 'SET NULL'),
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    approvedBy: foreignKey('teachers', true, 'SET NULL'),
    approvedDate: { type: DataTypes.DATE, allowNull: true },
    decisionDate: { type: DataTypes.DATE, allowNull: true },
    adminNote: { type: DataTypes.TEXT, allowNull: true },
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'proxy_requests', {
    id: idColumn(),
    slotId: foreignKey('lecture_slots', false),
    subjectId: foreignKey('subjects', false),
    classId: foreignKey('classes', false),
    originalFacultyId: foreignKey('teachers', false),
    proxyFacultyId: foreignKey('teachers', false),
    hodId: foreignKey('teachers', false),
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    reason: { type: DataTypes.STRING(500), allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    activeRequestKey: { type: DataTypes.SMALLINT, allowNull: true, defaultValue: 1 },
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'proxy_assignments', {
    id: idColumn(),
    slotId: foreignKey('lecture_slots', false),
    date: { type: DataTypes.DATEONLY, allowNull: false },
    originalFacultyId: foreignKey('teachers', false),
    proxyFacultyId: foreignKey('teachers', false),
    ...timestampColumns()
  }, transaction);

  await create(queryInterface, 'lecture_logs', {
    id: idColumn(),
    slotId: foreignKey('lecture_slots', false),
    date: { type: DataTypes.DATEONLY, allowNull: false },
    topicCovered: { type: DataTypes.STRING(500), allowNull: false },
    markedBy: foreignKey('teachers', false),
    ...timestampColumns()
  }, transaction);

  await addIndex(queryInterface, 'students', ['classId', 'batchId'], transaction, 'idx_students_class_batch');
  await addIndex(queryInterface, 'classes', ['name', 'department', 'semester'], transaction, 'classes_name_department_semester', true);
  await addIndex(queryInterface, 'classes', ['classCoordinatorId'], transaction, 'classes_class_coordinator_id');
  await addIndex(queryInterface, 'batches', ['name', 'classId'], transaction, 'batches_name_class_id', true);
  await addIndex(queryInterface, 'subjects', ['theoryFacultyId'], transaction, 'subjects_theory_faculty_id');
  await addIndex(queryInterface, 'subjects', ['labFacultyId'], transaction, 'subjects_lab_faculty_id');
  await addIndex(queryInterface, 'subject_classes', ['classId'], transaction, 'subject_classes_class_id');

  await addIndex(queryInterface, 'attendances', ['studentId', 'subjectId', 'classId', 'date'], transaction, 'attendances_student_id_subject_id_class_id_date');
  await addIndex(queryInterface, 'attendances', ['subjectId', 'date'], transaction, 'attendances_subject_id_date');
  await addIndex(queryInterface, 'attendances', ['studentId', 'subjectId'], transaction, 'attendances_student_id_subject_id');
  await addIndex(queryInterface, 'attendances', ['classId', 'date'], transaction, 'attendances_class_id_date');
  await addIndex(queryInterface, 'attendances', ['slotId', 'date'], transaction, 'idx_attendance_slot_date');
  await addIndex(queryInterface, 'attendances', ['studentId', 'subjectId', 'date'], transaction, 'idx_attendance_student_subject_date');
  await addIndex(queryInterface, 'attendances', ['studentId', 'subjectId', 'slotId'], transaction, 'idx_attendance_student_subject_slot');
  await addIndex(queryInterface, 'attendances', ['slotId', 'studentId', 'date'], transaction, 'unique_slot_student_date', true);

  await addIndex(queryInterface, 'lecture_slots', ['facultyId', 'dayOfWeek', 'startTime', 'endTime', 'isActive'], transaction, 'idx_lecture_slot_faculty_day_time');
  await addIndex(queryInterface, 'lecture_slots', ['classId'], transaction, 'lecture_slots_class_id');
  await addIndex(queryInterface, 'lecture_slots', ['subjectId'], transaction, 'lecture_slots_subject_id');

  await addIndex(queryInterface, 'leave_applications', ['studentId'], transaction, 'leave_applications_student_id');
  await addIndex(queryInterface, 'leave_applications', ['classId'], transaction, 'leave_applications_class_id');
  await addIndex(queryInterface, 'leave_applications', ['sentTo'], transaction, 'leave_applications_sent_to');
  await addIndex(queryInterface, 'leave_applications', ['coordinatorId'], transaction, 'leave_applications_coordinator_id');
  await addIndex(queryInterface, 'leave_applications', ['hodId'], transaction, 'leave_applications_hod_id');
  await addIndex(queryInterface, 'leave_applications', ['status'], transaction, 'leave_applications_status');
  await addIndex(queryInterface, 'leave_applications', ['fromDate', 'toDate'], transaction, 'leave_applications_from_date_to_date');

  await addIndex(queryInterface, 'proxy_requests', ['hodId', 'status'], transaction, 'proxy_requests_hod_id_status');
  await addIndex(queryInterface, 'proxy_requests', ['proxyFacultyId', 'status'], transaction, 'proxy_requests_proxy_faculty_id_status');
  await addIndex(queryInterface, 'proxy_requests', ['slotId', 'date'], transaction, 'proxy_requests_slot_id_date');
  await addIndex(queryInterface, 'proxy_requests', ['slotId', 'date', 'activeRequestKey'], transaction, 'unique_active_proxy_request', true);

  await addIndex(queryInterface, 'proxy_assignments', ['slotId', 'date'], transaction, 'unique_proxy_slot_date', true);
  await addIndex(queryInterface, 'proxy_assignments', ['proxyFacultyId', 'date', 'slotId'], transaction, 'idx_proxy_assignment_proxy_date');
  await addIndex(queryInterface, 'lecture_logs', ['slotId', 'date'], transaction, 'unique_slot_date_log', true);
};

const down = async ({ sequelize, queryInterface, transaction }) => {
  const [identityRows] = await sequelize.query(
    'SELECT current_database() AS database, current_user AS connected_user, current_schema() AS schema',
    { transaction }
  );
  const identity = identityRows[0];

  if (
    identity.database !== 'sal_attendance' ||
    identity.connected_user !== 'sal_user' ||
    identity.schema !== 'public'
  ) {
    throw new Error('Initial schema rollback is restricted to sal_attendance as sal_user in public.');
  }

  for (const table of applicationTables) {
    const quotedTable = queryInterface.queryGenerator.quoteTable(table);
    const [result] = await sequelize.query(
      `SELECT EXISTS (SELECT 1 FROM ${quotedTable} LIMIT 1) AS has_rows`,
      { transaction }
    );
    if (result[0].has_rows) {
      throw new Error(`Rollback refused because ${table} contains data.`);
    }
  }

  for (const table of dropOrder) {
    await queryInterface.dropTable(table, { transaction });
  }

  const enumTypes = [
    ['teachers', 'priority'],
    ['subjects', 'type'],
    ['attendances', 'type'],
    ['attendances', 'status'],
    ['lecture_slots', 'type'],
    ['lecture_slots', 'dayOfWeek'],
    ['leave_applications', 'sentTo'],
    ['leave_applications', 'status'],
    ['proxy_requests', 'status']
  ];

  for (const [table, column] of enumTypes) {
    const enumName = queryInterface.queryGenerator
      .pgEnumName(table, column, { schema: false })
      .replaceAll('"', '');
    await queryInterface.dropEnum(enumName, { transaction });
  }
};

module.exports = { preflight, up, down };
