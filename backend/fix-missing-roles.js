/**
 * SAL Education - Fix Missing Roles
 * 
 * This script updates existing records that may not have roles set.
 * Run with: npm run fix:roles
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const { Admin, Teacher, Student, sequelize } = require('./models');
const { connectDB } = require('./config/db');

const fixMissingRoles = async () => {
  try {
    // Connect to MySQL
    await connectDB();
    console.log('MySQL Connected...');
    
    // Fix Admin roles
    console.log('Fixing Admin roles...');
    const adminsUpdated = await Admin.update(
      { role: 'admin' },
      { where: { role: [null, ''] } }
    );
    console.log(`   ${adminsUpdated[0]} admin records updated`);
    
    // Fix Teacher roles
    console.log('Fixing Teacher roles...');
    const teachersUpdated = await Teacher.update(
      { role: 'teacher' },
      { where: { role: [null, ''] } }
    );
    console.log(`   ${teachersUpdated[0]} teacher records updated`);
    
    // Fix Student roles
    console.log('Fixing Student roles...');
    const studentsUpdated = await Student.update(
      { role: 'student' },
      { where: { role: [null, ''] } }
    );
    console.log(`   ${studentsUpdated[0]} student records updated`);
    
    // Also ensure all isActive fields are set correctly
    console.log('Ensuring isActive fields...');
    await Admin.update(
      { isActive: true },
      { where: { isActive: null } }
    );
    await Teacher.update(
      { isActive: true },
      { where: { isActive: null } }
    );
    await Student.update(
      { isActive: true },
      { where: { isActive: null } }
    );
    console.log('   isActive fields ensured for all users');
    
    console.log('\n✅ Role fixes completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing roles:', error.message);
    process.exit(1);
  }
};

fixMissingRoles();
