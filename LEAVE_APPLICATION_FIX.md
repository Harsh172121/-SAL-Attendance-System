# Leave Application Permission Error - Fixed

## Problem
Students were getting an "Access denied. Student privileges required" error when trying to apply for leave.

## Root Cause Analysis
The error originated from the `studentOnly` middleware which checks if `req.user.role === 'student'`. The student was successfully authenticated (got past the `protect` middleware), but their role wasn't properly set to 'student' in the request object.

### Why This Happened
1. **Database seeding issue**: The original seeder didn't explicitly set the `role` field when creating students, relying on Sequelize model defaults which weren't being applied correctly in bulk operations.
2. **Missing role in Token**: If the role wasn't in the database, the JWT token wouldn't encode the correct role, causing the permission check to fail.

## Solution Implemented

### 1. Updated Seeder (`backend/seeder.js`)
- **Admin creation**: Now explicitly sets `role: 'admin'` and `isActive: true`
- **Teacher creation**: Maps roles explicitly with `role: 'teacher'` and `isActive: true`
- **Student creation**: Now includes `role: 'student'` and `isActive: true` in bulk create

**Changes:**
```javascript
// Before
const createdStudents = await Student.bulkCreate(studentsWithRefs, { individualHooks: true });

// After
const studentsWithRefs = students.map(student => ({
  enrollmentNo: student.enrollmentNo,
  name: student.name,
  email: student.email,
  password: student.password,
  phone: student.phone,
  classId: createdClasses[student.classIndex].id,
  batchId: createdBatches[student.batchIndex].id,
  role: 'student',        // ← Explicitly set
  isActive: true          // ← Explicitly set
}));
const createdStudents = await Student.bulkCreate(studentsWithRefs, { individualHooks: true });
```

### 2. Created Role Fix Script (`backend/fix-missing-roles.js`)
A utility script that updates any existing records in the database that might have missing or NULL roles:
- Updates Admin records: sets `role: 'admin'`
- Updates Teacher records: sets `role: 'teacher'`
- Updates Student records: sets `role: 'student'`
- Ensures all `isActive` fields are set to `true`

### 3. Added npm Scripts
Added to `backend/package.json`:
```json
"fix:roles": "node fix-missing-roles.js",
"test:leave": "node test-leave.js"
```

### 4. Verification Script (`backend/test-leave.js`)
Checks that students have proper roles configured:
- Verifies student record in database has `role: 'student'`
- Verifies JWT token generation with correct role
- Compares with teacher data for validation

## How to Apply This Fix

### Option 1: Fresh Database (Recommended)
```bash
cd backend
npm run seed
```

This will:
1. Clear all existing data
2. Create new Admin, Teachers, and Students with correct roles
3. Seed sample attendance data
4. Create sample leave applications (optional)

### Option 2: Fix Existing Database
If you have existing data you want to keep, run:
```bash
cd backend
npm run fix:roles
```

This updates any records with missing roles without deleting data.

### Option 3: Verify Configuration
To verify everything is set up correctly:
```bash
cd backend
npm run test:leave
```

Output should show:
- `Role in DB: 'student'` ✓
- `Role === 'student': true` ✓
- `Decoded token role: 'student'` ✓
- `Token role === 'student': true` ✓

## Authentication Flow

### 1. Login
Student logs in with email and password (with role='student'):
```
POST /api/auth/login
{
  "email": "rahul@sal.edu",
  "password": "student123",
  "role": "student"
}
```

### 2. Backend Authentication
- Auth controller finds student by email
- Generates JWT token with `generateToken(user.id, 'student')`
- Token contains: `{ id: <studentId>, role: 'student' }`

### 3. Request with Token
Every subsequent request includes the token:
```
Authorization: Bearer <token>
```

### 4. Permission Middleware
- `protect` middleware verifies token and decodes it
- Sets `req.user.role = decoded.role` (which is 'student')
- `studentOnly` middleware checks `req.user.role === 'student'`
- If match, request proceeds; otherwise 403 error

## Verification Checklist

✓ Database seeder explicitly sets roles  
✓ Fix script available for existing databases  
✓ Test script validates configuration  
✓ Auth controller properly returns role in response  
✓ JWT token includes role  
✓ studentOnly middleware checks role correctly  
✓ Leave application routes require studentOnly middleware  

## Login Credentials (After Seeding)

### Student Account
```
Email: rahul@sal.edu
Password: student123
Role: student
```

### Admin Account
```
Email: admin@sal.edu
Password: admin123
Role: admin
```

### Teacher Account
```
Email: rajesh@sal.edu
Password: teacher123
Role: teacher
```

## Testing Leave Application

1. Login with student credentials (rahul@sal.edu / student123)
2. Navigate to Student Dashboard → Leave Applications
3. Click "Apply New Leave"
4. Fill in the form:
   - From Date: 2026-02-01
   - To Date: 2026-02-03
   - Reason: "Test leave application"
   - Send To: BOTH
5. Submit the form

Expected: Leave application submitted successfully ✓

## Backend API Changes
No API changes were made. All existing endpoints work exactly as before.

## Frontend Changes
No frontend changes were made. The authentication flow remains unchanged.

## Summary
The issue was caused by missing explicit role assignment in the database seeder. By updating the seeder to explicitly set roles and providing a fix script for existing databases, all students can now successfully apply for leave with proper authorization.
