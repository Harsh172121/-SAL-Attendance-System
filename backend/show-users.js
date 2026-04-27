const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const { Student, Teacher, Admin, Subject } = require('./models');

(async () => {
  try {
    await connectDB();
    
    console.log('\n📋 ALL USERS IN DATABASE\n');
    console.log('═'.repeat(70));
    
    // Admin
    console.log('\n👤 ADMIN USERS:');
    const admins = await Admin.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    admins.forEach(a => console.log(`   ID: ${a.id} | Name: ${a.name} | Email: ${a.email}`));
    
    // Teachers
    console.log('\n👨‍🏫 TEACHERS:');
    const teachers = await Teacher.findAll({ attributes: ['id', 'name', 'email', 'role', 'priority'] });
    teachers.forEach(t => console.log(`   ID: ${t.id} | Name: ${t.name} | Email: ${t.email} | Priority: ${t.priority}`));
    
    // Students
    console.log('\n🎓 STUDENTS:');
    const students = await Student.findAll({ attributes: ['id', 'name', 'email', 'enrollmentNo', 'role'] });
    students.forEach(s => console.log(`   ID: ${s.id} | Name: ${s.name} | Email: ${s.email} | Enrollment: ${s.enrollmentNo}`));

    // Subjects
    console.log('\n📚 SUBJECTS:');
    const subjects = await Subject.findAll({
      attributes: ['id', 'code', 'name', 'type', 'theoryFacultyId', 'labFacultyId', 'credits', 'isActive']
    });
    if (subjects.length === 0) {
      console.log('   (No subjects found)');
    } else {
      subjects.forEach(sub => {
        const theoryFac = sub.theoryFacultyId ? `Theory Faculty ID: ${sub.theoryFacultyId}` : '';
        const labFac = sub.labFacultyId ? `Lab Faculty ID: ${sub.labFacultyId}` : '';
        const facInfo = [theoryFac, labFac].filter(Boolean).join(' | ') || 'No faculty assigned';
        console.log(`   ID: ${sub.id} | Code: ${sub.code} | Name: ${sub.name} | Type: ${sub.type} | Credits: ${sub.credits} | ${facInfo} | Active: ${sub.isActive}`);
      });
    }
    
    console.log('\n═'.repeat(70));
    console.log('\n🔐 DEFAULT PASSWORDS (Set during database seed):\n');
    console.log('   Admin:    admin123');
    console.log('   Teachers: teacher123');
    console.log('   Students: student123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
