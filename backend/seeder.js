/**
 * SAL Education - Database Seeder
 * 
 * This file seeds the database with initial dummy data.
 * Run with: npm run seed
 * 
 * VIVA NOTE: Seeder creates sample data for testing.
 * Passwords are hashed automatically by the model hooks.
 */

const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models and connection
const { Admin, Teacher, Student, Class, Batch, Subject, Attendance, sequelize } = require('./models');
const { connectDB } = require('./config/db');

// ============================================
// SEED DATA
// ============================================

const classes = [
  { name: 'CE-5A', department: 'Computer Engineering', semester: 5, academicYear: '2025-26' },
  { name: 'CE-5B', department: 'Computer Engineering', semester: 5, academicYear: '2025-26' },
  { name: 'IT-5A', department: 'Information Technology', semester: 5, academicYear: '2025-26' },
  { name: 'IT-5B', department: 'Information Technology', semester: 5, academicYear: '2025-26' },
  { name: 'CE-6A', department: 'Computer Engineering', semester: 6, academicYear: '2025-26' },
  { name: 'CE-6B', department: 'Computer Engineering', semester: 6, academicYear: '2025-26' },
];

const batches = [
  { name: 'Batch A', classIndex: 0 },
  { name: 'Batch B', classIndex: 0 },
  { name: 'Batch C', classIndex: 0 },
  { name: 'Batch A', classIndex: 1 },
  { name: 'Batch B', classIndex: 1 },
  { name: 'Batch A', classIndex: 2 },
  { name: 'Batch B', classIndex: 2 },
  { name: 'Batch A', classIndex: 4 },
  { name: 'Batch B', classIndex: 4 },
];

const admin = {
  name: 'Admin User',
  email: 'admin@sal.edu',
  password: 'admin123'
};

const teachers = [
  { employeeId: 'SAL-T001', name: 'Prof. Rajesh Kumar', email: 'rajesh@sal.edu', password: 'teacher123', phone: '9876543100', department: 'Computer Engineering', qualification: 'M.Tech, PhD' },
  { employeeId: 'SAL-T002', name: 'Prof. Sunita Sharma', email: 'sunita@sal.edu', password: 'teacher123', phone: '9876543101', department: 'Computer Engineering', qualification: 'M.Tech' },
  { employeeId: 'SAL-T003', name: 'Prof. Anil Patel', email: 'anil@sal.edu', password: 'teacher123', phone: '9876543102', department: 'Information Technology', qualification: 'M.Tech, PhD' },
  { employeeId: 'SAL-T004', name: 'Prof. Meera Singh', email: 'meera@sal.edu', password: 'teacher123', phone: '9876543103', department: 'Information Technology', qualification: 'M.Tech' },
  { employeeId: 'SAL-T005', name: 'Prof. Vijay Desai', email: 'vijay@sal.edu', password: 'teacher123', phone: '9876543104', department: 'Computer Engineering', qualification: 'PhD' },
];

const students = [
  { enrollmentNo: 'SAL2024001', name: 'Rahul Sharma', email: 'rahul@sal.edu', password: 'student123', phone: '9876543210', classIndex: 0, batchIndex: 0 },
  { enrollmentNo: 'SAL2024002', name: 'Priya Patel', email: 'priya@sal.edu', password: 'student123', phone: '9876543211', classIndex: 0, batchIndex: 0 },
  { enrollmentNo: 'SAL2024003', name: 'Amit Kumar', email: 'amit@sal.edu', password: 'student123', phone: '9876543212', classIndex: 0, batchIndex: 1 },
  { enrollmentNo: 'SAL2024004', name: 'Sneha Singh', email: 'sneha@sal.edu', password: 'student123', phone: '9876543213', classIndex: 0, batchIndex: 1 },
  { enrollmentNo: 'SAL2024005', name: 'Vikram Desai', email: 'vikram@sal.edu', password: 'student123', phone: '9876543214', classIndex: 0, batchIndex: 2 },
  { enrollmentNo: 'SAL2024006', name: 'Ananya Mehta', email: 'ananya@sal.edu', password: 'student123', phone: '9876543215', classIndex: 1, batchIndex: 3 },
  { enrollmentNo: 'SAL2024007', name: 'Rohan Joshi', email: 'rohan@sal.edu', password: 'student123', phone: '9876543216', classIndex: 1, batchIndex: 3 },
  { enrollmentNo: 'SAL2024008', name: 'Kavya Reddy', email: 'kavya@sal.edu', password: 'student123', phone: '9876543217', classIndex: 1, batchIndex: 4 },
  { enrollmentNo: 'SAL2024009', name: 'Arjun Nair', email: 'arjun@sal.edu', password: 'student123', phone: '9876543218', classIndex: 2, batchIndex: 5 },
  { enrollmentNo: 'SAL2024010', name: 'Ishita Gupta', email: 'ishita@sal.edu', password: 'student123', phone: '9876543219', classIndex: 2, batchIndex: 6 },
  { enrollmentNo: 'SAL2024011', name: 'Karan Verma', email: 'karan@sal.edu', password: 'student123', phone: '9876543220', classIndex: 4, batchIndex: 7 },
  { enrollmentNo: 'SAL2024012', name: 'Neha Agarwal', email: 'neha@sal.edu', password: 'student123', phone: '9876543221', classIndex: 4, batchIndex: 8 },
];

const subjects = [
  { code: 'CS501', name: 'Database Management System', type: 'theory+lab', classIndex: 0, theoryTeacherIndex: 0, labTeacherIndex: 1, credits: 4 },
  { code: 'CS502', name: 'Operating System', type: 'theory+lab', classIndex: 0, theoryTeacherIndex: 1, labTeacherIndex: 0, credits: 4 },
  { code: 'CS503', name: 'Computer Networks', type: 'theory', classIndex: 0, theoryTeacherIndex: 0, labTeacherIndex: null, credits: 3 },
  { code: 'CS504', name: 'Web Development Lab', type: 'lab', classIndex: 0, theoryTeacherIndex: null, labTeacherIndex: 1, credits: 2 },
  { code: 'IT501', name: 'Software Engineering', type: 'theory+lab', classIndex: 2, theoryTeacherIndex: 2, labTeacherIndex: 3, credits: 4 },
  { code: 'IT502', name: 'Cloud Computing', type: 'theory', classIndex: 2, theoryTeacherIndex: 3, labTeacherIndex: null, credits: 3 },
  { code: 'CS601', name: 'Machine Learning', type: 'theory+lab', classIndex: 4, theoryTeacherIndex: 4, labTeacherIndex: 0, credits: 4 },
  { code: 'CS602', name: 'Compiler Design', type: 'theory', classIndex: 4, theoryTeacherIndex: 4, labTeacherIndex: null, credits: 3 },
];

// ============================================
// SEED FUNCTION
// ============================================

const seedDatabase = async () => {
  try {
    // Connect to MySQL
    await connectDB();
    console.log('MySQL Connected for seeding...');
    
    // Clear existing data (disable foreign key checks for MySQL)
    console.log('🗑️  Clearing existing data...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await Attendance.destroy({ where: {}, truncate: true });
    await Subject.destroy({ where: {}, truncate: true });
    await Student.destroy({ where: {}, truncate: true });
    await Batch.destroy({ where: {}, truncate: true });
    await Class.destroy({ where: {}, truncate: true });
    await Teacher.destroy({ where: {}, truncate: true });
    await Admin.destroy({ where: {}, truncate: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Existing data cleared');
    
    // Create Admin
    console.log('👤 Creating admin...');
    const createdAdmin = await Admin.create({
      ...admin,
      role: 'admin',
      isActive: true
    });
    console.log(`   Admin created: ${createdAdmin.email}`);
    
    // Create Teachers (use bulkCreate with individualHooks for password hashing)
    console.log('👨‍🏫 Creating teachers...');
    const teachersWithRole = teachers.map(teacher => ({
      ...teacher,
      role: 'teacher',
      isActive: true
    }));
    const createdTeachers = await Teacher.bulkCreate(teachersWithRole, { individualHooks: true });
    console.log(`   ${createdTeachers.length} teachers created`);
    
    // Create Classes
    console.log('🏫 Creating classes...');
    const createdClasses = await Class.bulkCreate(classes);
    console.log(`   ${createdClasses.length} classes created`);
    
    // Create Batches
    console.log('📦 Creating batches...');
    const batchesWithClassId = batches.map(batch => ({
      name: batch.name,
      classId: createdClasses[batch.classIndex].id
    }));
    const createdBatches = await Batch.bulkCreate(batchesWithClassId);
    console.log(`   ${createdBatches.length} batches created`);
    
    // Create Students (use bulkCreate with individualHooks for password hashing)
    console.log('🎓 Creating students...');
    const studentsWithRefs = students.map(student => ({
      enrollmentNo: student.enrollmentNo,
      name: student.name,
      email: student.email,
      password: student.password,
      phone: student.phone,
      classId: createdClasses[student.classIndex].id,
      batchId: createdBatches[student.batchIndex].id,
      role: 'student',
      isActive: true
    }));
    const createdStudents = await Student.bulkCreate(studentsWithRefs, { individualHooks: true });
    console.log(`   ${createdStudents.length} students created`);
    
    // Create Subjects
    console.log('📚 Creating subjects...');
    const createdSubjects = [];
    for (const subject of subjects) {
      const createdSubject = await Subject.create({
        code: subject.code,
        name: subject.name,
        type: subject.type,
        theoryFacultyId: subject.theoryTeacherIndex !== null ? createdTeachers[subject.theoryTeacherIndex].id : null,
        labFacultyId: subject.labTeacherIndex !== null ? createdTeachers[subject.labTeacherIndex].id : null,
        credits: subject.credits
      });
      
      // Assign to class via junction table
      const classId = createdClasses[subject.classIndex].id;
      await createdSubject.setClasses([classId]);
      createdSubjects.push(createdSubject);
    }
    console.log(`   ${createdSubjects.length} subjects created`);
    
    // Create Sample Attendance
    console.log('📝 Creating sample attendance...');
    const attendanceRecords = [];
    
    // DBMS Theory attendance for CE-5A - Jan 27, 2026
    const dbmsSubject = createdSubjects.find(s => s.code === 'CS501');
    const ce5aStudents = createdStudents.filter(s => s.classId === createdClasses[0].id);
    
    ce5aStudents.forEach((student, index) => {
      attendanceRecords.push({
        studentId: student.id,
        subjectId: dbmsSubject.id,
        classId: createdClasses[0].id,
        date: '2026-01-27',
        type: 'theory',
        status: index % 4 === 2 ? 'absent' : 'present', // 1 absent
        markedBy: createdTeachers[0].id
      });
    });
    
    // DBMS Lab attendance for Batch A - Jan 27, 2026
    const batchAStudents = ce5aStudents.filter(s => s.batchId === createdBatches[0].id);
    batchAStudents.forEach((student) => {
      attendanceRecords.push({
        studentId: student.id,
        subjectId: dbmsSubject.id,
        classId: createdClasses[0].id,
        batchId: createdBatches[0].id,
        date: '2026-01-27',
        type: 'lab',
        status: 'present',
        markedBy: createdTeachers[1].id
      });
    });
    
    // OS Theory attendance - Jan 28, 2026
    const osSubject = createdSubjects.find(s => s.code === 'CS502');
    ce5aStudents.forEach((student, index) => {
      attendanceRecords.push({
        studentId: student.id,
        subjectId: osSubject.id,
        classId: createdClasses[0].id,
        date: '2026-01-28',
        type: 'theory',
        status: index % 4 === 3 ? 'absent' : 'present',
        markedBy: createdTeachers[1].id
      });
    });
    
    // CN Theory attendance - Jan 29, 2026
    const cnSubject = createdSubjects.find(s => s.code === 'CS503');
    ce5aStudents.forEach((student, index) => {
      attendanceRecords.push({
        studentId: student.id,
        subjectId: cnSubject.id,
        classId: createdClasses[0].id,
        date: '2026-01-29',
        type: 'theory',
        status: index % 5 === 1 ? 'absent' : 'present',
        markedBy: createdTeachers[0].id
      });
    });
    
    await Attendance.bulkCreate(attendanceRecords);
    console.log(`   ${attendanceRecords.length} attendance records created`);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📋 LOGIN CREDENTIALS:\n');
    console.log('ADMIN:');
    console.log(`   Email: admin@sal.edu`);
    console.log(`   Password: admin123\n`);
    console.log('TEACHER (Example):');
    console.log(`   Email: rajesh@sal.edu`);
    console.log(`   Password: teacher123\n`);
    console.log('STUDENT (Example):');
    console.log(`   Email: rahul@sal.edu`);
    console.log(`   Password: student123\n`);
    console.log('='.repeat(50));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
