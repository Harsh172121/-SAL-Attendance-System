/**
 * Quick script to reset DB to single teacher + student
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const { sequelize } = require('./config/db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL');

    const salt = await bcrypt.genSalt(10);
    const teacherPwd = await bcrypt.hash('teacher123', salt);
    const studentPwd = await bcrypt.hash('student123', salt);

    // Disable FK checks, wipe and re-insert
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DELETE FROM attendances');
    await sequelize.query('DELETE FROM subjects');
    await sequelize.query('DELETE FROM students');
    await sequelize.query('DELETE FROM batches');
    await sequelize.query('DELETE FROM classes');
    await sequelize.query('DELETE FROM teachers');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Insert single teacher
    await sequelize.query(`
      INSERT INTO teachers (employeeId, name, email, password, phone, department, qualification, role, priority, isActive, createdAt, updatedAt)
      VALUES ('SAL-T001', 'Teacher User', 'teacher@sal.edu', '${teacherPwd}', '9876543100', 'Computer Engineering', 'M.Tech', 'teacher', 'FACULTY', 1, NOW(), NOW())
    `);

    // Insert single student (need to allow null classId temporarily)
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('ALTER TABLE students MODIFY classId INT NULL');
    await sequelize.query(`
      INSERT INTO students (enrollmentNo, name, email, password, phone, classId, batchId, role, isActive, createdAt, updatedAt)
      VALUES ('SAL2024001', 'Student User', 'student@sal.edu', '${studentPwd}', '9876543210', NULL, NULL, 'student', 1, NOW(), NOW())
    `);
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Verify
    const [teachers] = await sequelize.query('SELECT id, email FROM teachers');
    const [students] = await sequelize.query('SELECT id, email FROM students');
    const [admins] = await sequelize.query('SELECT id, email FROM admins');

    console.log('\n✅ Database reset complete!');
    console.log('Admins:', admins);
    console.log('Teachers:', teachers);
    console.log('Students:', students);
    console.log('\nLogin credentials:');
    console.log('  Admin:   admin@sal.edu / admin123');
    console.log('  Teacher: teacher@sal.edu / teacher123');
    console.log('  Student: student@sal.edu / student123');

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
