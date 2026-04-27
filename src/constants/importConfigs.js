export const importConfigs = {
  classes: {
    entity: 'classes',
    singular: 'class',
    title: 'Bulk Import Classes',
    description: 'Upload a CSV or XML file to create or update class records in one step.',
    matchBy: 'Existing rows are matched by name + department + semester.',
    requiredFields: ['name', 'department', 'semester'],
    optionalFields: ['academicYear', 'isActive'],
    sampleRow: {
      name: 'CE-5A',
      department: 'Computer Engineering',
      semester: '5',
      academicYear: '2025-26',
      isActive: 'true'
    },
    notes: [
      'Department values should match the backend class departments, for example Computer Engineering or Information Technology.',
      'If the same class already exists, the import updates academicYear and active status.'
    ]
  },
  batches: {
    entity: 'batches',
    singular: 'batch',
    title: 'Bulk Import Batches',
    description: 'Upload a CSV or XML file to import batch records linked to classes.',
    matchBy: 'Existing rows are matched by batch name + class.',
    requiredFields: ['name', 'className'],
    optionalFields: ['classId', 'classDepartment', 'classSemester', 'description', 'isActive'],
    sampleRow: {
      name: 'Batch A',
      className: 'CE-5A',
      classDepartment: 'Computer Engineering',
      classSemester: '5',
      description: 'Lab group A',
      isActive: 'true'
    },
    notes: [
      'Use classId when available, or provide className with classDepartment/classSemester if the class name is ambiguous.',
      'If the batch already exists in the same class, the description and active status are updated.'
    ]
  },
  students: {
    entity: 'students',
    singular: 'student',
    title: 'Bulk Import Students',
    description: 'Upload a CSV or XML file to create or update student accounts and assignments.',
    matchBy: 'Existing rows are matched by enrollmentNo.',
    requiredFields: ['enrollmentNumber', 'fullName', 'email', 'class'],
    optionalFields: ['phoneNumber', 'batchForLabs', 'password', 'isActive'],
    displayRequiredFields: ['Enrollment Number', 'Full Name', 'Email', 'Class'],
    displayOptionalFields: ['Phone Number', 'Batch (for Labs)', 'Password', 'isActive'],
    csvFields: ['Enrollment Number', 'Full Name', 'Email', 'Phone Number', 'Class', 'Batch (for Labs)'],
    csvSampleRow: {
      'Enrollment Number': 'SAL2025001',
      'Full Name': 'Riya Shah',
      'Email': 'riya@sal.edu',
      'Phone Number': '9876543200',
      'Class': 'CE-5A',
      'Batch (for Labs)': 'Batch A'
    },
    sampleRow: {
      enrollmentNumber: 'SAL2025001',
      fullName: 'Riya Shah',
      email: 'riya@sal.edu',
      phoneNumber: '9876543200',
      class: 'CE-5A',
      batchForLabs: 'Batch A',
      password: 'student123',
      isActive: 'true'
    },
    notes: [
      'CSV ma tamne form jeva headers j aapva pade: Enrollment Number, Full Name, Email, Phone Number, Class, Batch (for Labs).',
      'Batch is optional. If provided, it must belong to the referenced class.',
      'When password is omitted, the system uses the enrollment number as the default password.'
    ]
  },
  teachers: {
    entity: 'teachers',
    singular: 'teacher',
    title: 'Bulk Import Teachers',
    description: 'Upload a CSV or XML file to create or update faculty records.',
    matchBy: 'Existing rows are matched by employeeId.',
    requiredFields: ['employeeId', 'name', 'email', 'department / departments'],
    optionalFields: ['phone', 'qualification', 'password', 'isActive'],
    sampleRow: {
      employeeId: 'SAL-T100',
      name: 'Prof. Deep Shah',
      email: 'deep@sal.edu',
      phone: '9876543109',
      department: 'Computer Engineering, Information Technology',
      qualification: 'M.Tech',
      password: 'teacher123',
      isActive: 'true'
    },
    notes: [
      'Use `department` or `departments`. Multiple departments can be comma-separated in one field.',
      'If password is omitted, the system uses the employee ID as the default password.',
      'Existing teachers are updated instead of duplicated.'
    ]
  },
  subjects: {
    entity: 'subjects',
    singular: 'subject',
    title: 'Bulk Import Subjects',
    description: 'Upload a CSV or XML file to create or update subject records with faculty assignment.',
    matchBy: 'Existing rows are matched by subject code.',
    requiredFields: ['code', 'name', 'type', 'className'],
    optionalFields: ['classId', 'classDepartment', 'classSemester', 'theoryFacultyEmployeeId', 'labFacultyEmployeeId', 'credits', 'isActive'],
    sampleRow: {
      code: 'CS505',
      name: 'Data Warehousing',
      type: 'theory+lab',
      className: 'CE-5A',
      classDepartment: 'Computer Engineering',
      classSemester: '5',
      theoryFacultyEmployeeId: 'SAL-T001',
      labFacultyEmployeeId: 'SAL-T002',
      credits: '4',
      isActive: 'true'
    },
    notes: [
      'Accepted subject types are theory, lab, and theory+lab.',
      'For theory or theory+lab, theoryFacultyEmployeeId is required. For lab or theory+lab, labFacultyEmployeeId is required.'
    ]
  }
};

export default importConfigs;
