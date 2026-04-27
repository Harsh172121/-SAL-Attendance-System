/* global module */
const ensureColumn = async (sequelize, table, field, sql) => {
  const [result] = await sequelize.query(`SHOW COLUMNS FROM ${table} WHERE Field='${field}'`);

  if (result.length === 0) {
    console.log(`Adding ${field} column to ${table}...`);
    await sequelize.query(sql);
    console.log(`${field} column added successfully`);
  } else {
    console.log(`${field} column already exists on ${table}`);
  }
};

const ensureTable = async (sequelize, table, sql) => {
  const [result] = await sequelize.query(`SHOW TABLES LIKE '${table}'`);

  if (result.length === 0) {
    console.log(`Creating ${table} table...`);
    await sequelize.query(sql);
    console.log(`${table} table created successfully`);
  } else {
    console.log(`${table} table already exists`);
  }
};

const ensureIndex = async (sequelize, table, indexName, sql) => {
  const [result] = await sequelize.query(
    `SHOW INDEX FROM ${table} WHERE Key_name='${indexName}'`
  );

  if (result.length === 0) {
    console.log(`Creating index ${indexName} on ${table}...`);
    try {
      await sequelize.query(sql);
      console.log(`Index ${indexName} created successfully`);
    } catch (error) {
      const mysqlErrorCode = error?.original?.errno;
      const mysqlErrorMessage = error?.original?.sqlMessage || error?.message || '';

      if (mysqlErrorCode === 1069 || mysqlErrorMessage.includes('max 64 keys allowed')) {
        console.warn(
          `Skipping index ${indexName} on ${table}: MySQL key limit reached (max 64 keys).`
        );
        return;
      }

      throw error;
    }
  } else {
    console.log(`Index ${indexName} already exists on ${table}`);
  }
};

const ensureSchema = async (sequelize) => {
  await ensureTable(
    sequelize,
    'classrooms',
    `CREATE TABLE classrooms (
      id INT AUTO_INCREMENT PRIMARY KEY,
      classroom_number INT NOT NULL UNIQUE
    )`
  );

  await ensureColumn(
    sequelize,
    'attendances',
    'slotId',
    "ALTER TABLE attendances ADD COLUMN slotId INT NULL REFERENCES lecture_slots(id)"
  );

  await ensureColumn(
    sequelize,
    'teachers',
    'priority',
    "ALTER TABLE teachers ADD COLUMN priority ENUM('ADMIN','PRINCIPAL','HOD','FACULTY','CLASS_COORDINATOR') NOT NULL DEFAULT 'FACULTY'"
  );

  await ensureColumn(
    sequelize,
    'teachers',
    'departments',
    'ALTER TABLE teachers ADD COLUMN departments JSON NULL'
  );

  await ensureColumn(
    sequelize,
    'classes',
    'classCoordinatorId',
    'ALTER TABLE classes ADD COLUMN classCoordinatorId INT NULL'
  );

  await ensureColumn(
    sequelize,
    'subjects',
    'theoryFacultyIds',
    'ALTER TABLE subjects ADD COLUMN theoryFacultyIds JSON NULL'
  );

  await ensureColumn(
    sequelize,
    'subjects',
    'labFacultyIds',
    'ALTER TABLE subjects ADD COLUMN labFacultyIds JSON NULL'
  );

  // CLEANUP: Remove legacy columns if they exist
  try {
    const [cols] = await sequelize.query("SHOW COLUMNS FROM subjects");
    const colNames = cols.map(c => c.Field.toLowerCase());
    
    if (colNames.includes('classid') || colNames.includes('classids')) {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      
      if (colNames.includes('classid')) {
        console.log('Removing legacy classId column from subjects...');
        await sequelize.query("ALTER TABLE subjects DROP COLUMN classId");
      }
      
      if (colNames.includes('classids')) {
        console.log('Removing legacy classIds column from subjects...');
        await sequelize.query("ALTER TABLE subjects DROP COLUMN classIds");
      }
      
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    }
  } catch (err) {
    console.warn('Legacy cleanup warning:', err.message);
  }

  await ensureColumn(
    sequelize,
    'lecture_slots',
    'classroomId',
    'ALTER TABLE lecture_slots ADD COLUMN classroomId INT NULL'
  );

  await ensureColumn(
    sequelize,
    'leave_applications',
    'sentTo',
    "ALTER TABLE leave_applications ADD COLUMN sentTo ENUM('CLASS_COORDINATOR','HOD','BOTH') NOT NULL DEFAULT 'BOTH'"
  );

  await ensureColumn(
    sequelize,
    'leave_applications',
    'coordinatorId',
    'ALTER TABLE leave_applications ADD COLUMN coordinatorId INT NULL'
  );

  await ensureColumn(
    sequelize,
    'leave_applications',
    'hodId',
    'ALTER TABLE leave_applications ADD COLUMN hodId INT NULL'
  );

  await ensureColumn(
    sequelize,
    'leave_applications',
    'decisionDate',
    'ALTER TABLE leave_applications ADD COLUMN decisionDate DATETIME NULL'
  );

  await ensureTable(
    sequelize,
    'proxy_requests',
    `CREATE TABLE proxy_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slotId INT NOT NULL,
      subjectId INT NOT NULL,
      classId INT NOT NULL,
      originalFacultyId INT NOT NULL,
      proxyFacultyId INT NOT NULL,
      hodId INT NOT NULL,
      status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      reason VARCHAR(500) NULL,
      date DATE NOT NULL,
      activeRequestKey TINYINT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  );

  await ensureTable(
    sequelize,
    'proxy_assignments',
    `CREATE TABLE proxy_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slotId INT NOT NULL,
      date DATE NOT NULL,
      originalFacultyId INT NOT NULL,
      proxyFacultyId INT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  );

  await ensureColumn(
    sequelize,
    'proxy_requests',
    'activeRequestKey',
    'ALTER TABLE proxy_requests ADD COLUMN activeRequestKey TINYINT NULL DEFAULT 1'
  );

  await sequelize.query(
    "UPDATE proxy_requests SET activeRequestKey = NULL WHERE status = 'rejected' AND activeRequestKey IS NOT NULL"
  );

  await ensureIndex(
    sequelize,
    'proxy_requests',
    'unique_active_proxy_request',
    'CREATE UNIQUE INDEX unique_active_proxy_request ON proxy_requests (slotId, date, activeRequestKey)'
  );

  await ensureIndex(
    sequelize,
    'attendances',
    'idx_attendance_slot_date',
    'CREATE INDEX idx_attendance_slot_date ON attendances (slotId, date)'
  );

  await ensureIndex(
    sequelize,
    'attendances',
    'idx_attendance_student_subject_date',
    'CREATE INDEX idx_attendance_student_subject_date ON attendances (studentId, subjectId, date)'
  );

  await ensureIndex(
    sequelize,
    'attendances',
    'idx_attendance_student_subject_slot',
    'CREATE INDEX idx_attendance_student_subject_slot ON attendances (studentId, subjectId, slotId)'
  );

  await ensureIndex(
    sequelize,
    'students',
    'idx_students_class_batch',
    'CREATE INDEX idx_students_class_batch ON students (classId, batchId)'
  );

  await ensureIndex(
    sequelize,
    'attendances',
    'unique_slot_student_date',
    'CREATE UNIQUE INDEX unique_slot_student_date ON attendances (slotId, studentId, date)'
  );

  await ensureIndex(
    sequelize,
    'lecture_slots',
    'idx_lecture_slot_faculty_day_time',
    'CREATE INDEX idx_lecture_slot_faculty_day_time ON lecture_slots (facultyId, dayOfWeek, startTime, endTime, isActive)'
  );

  await ensureIndex(
    sequelize,
    'proxy_assignments',
    'idx_proxy_assignment_proxy_date',
    'CREATE INDEX idx_proxy_assignment_proxy_date ON proxy_assignments (proxyFacultyId, date, slotId)'
  );
};

module.exports = {
  ensureSchema
};
