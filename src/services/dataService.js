/**
 * SAL Education - College Attendance Management System
 * Data Service
 * 
 * This file contains all API-based CRUD operations for the frontend.
 * Connected to MySQL backend via REST API.
 * 
 * VIVA NOTE: This service layer separates data logic from UI components,
 * making API integration clean and maintainable.
 */

import api from './api';

// ============================================
// CLASS CRUD OPERATIONS
// ============================================

export const classService = {
  /**
   * Get all classes
   * @returns {Promise<Array>} - All classes
   */
  getAll: async () => {
    try {
      const response = await api.get('/admin/classes');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  },

  /**
   * Get class by ID
   * @param {number} id - Class ID
   * @returns {Promise<Object|null>} - Class object or null
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/classes/${id}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching class:', error);
      return null;
    }
  },

  /**
   * Create new class
   * @param {Object} classData - Class data
   * @returns {Promise<Object>} - Created class
   */
  create: async (classData) => {
    try {
      const response = await api.post('/admin/classes', classData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  /**
   * Update class
   * @param {number} id - Class ID
   * @param {Object} classData - Updated data
   * @returns {Promise<Object|null>} - Updated class or null
   */
  update: async (id, classData) => {
    try {
      const response = await api.put(`/admin/classes/${id}`, classData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  /**
   * Delete class
   * @param {number} id - Class ID
   * @returns {Promise<boolean>} - Success status
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/classes/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }
};

// ============================================
// BATCH CRUD OPERATIONS
// ============================================

export const batchService = {
  /**
   * Get all batches
   * @returns {Promise<Array>} - All batches
   */
  getAll: async () => {
    try {
      const response = await api.get('/admin/batches');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching batches:', error);
      return [];
    }
  },

  /**
   * Get batches by class ID
   * @param {number} classId - Class ID
   * @returns {Promise<Array>} - Batches for the class
   */
  getByClassId: async (classId) => {
    try {
      const response = await api.get(`/admin/batches/class/${classId}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching batches by class:', error);
      return [];
    }
  },

  /**
   * Get batch by ID
   * @param {number} id - Batch ID
   * @returns {Promise<Object|null>} - Batch object or null
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/batches/${id}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching batch:', error);
      return null;
    }
  },

  /**
   * Create new batch
   * @param {Object} batchData - Batch data
   * @returns {Promise<Object>} - Created batch
   */
  create: async (batchData) => {
    try {
      const response = await api.post('/admin/batches', batchData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  },

  /**
   * Update batch
   * @param {number} id - Batch ID
   * @param {Object} batchData - Updated data
   * @returns {Promise<Object|null>} - Updated batch or null
   */
  update: async (id, batchData) => {
    try {
      const response = await api.put(`/admin/batches/${id}`, batchData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  },

  /**
   * Delete batch
   * @param {number} id - Batch ID
   * @returns {Promise<boolean>} - Success status
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/batches/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  }
};

// ============================================
// STUDENT CRUD OPERATIONS
// ============================================

export const studentService = {
  /**
   * Get all students
   * @returns {Promise<Array>} - All students
   */
  getAll: async () => {
    try {
      const response = await api.get('/admin/students');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  /**
   * Get students by class ID
   * @param {number} classId - Class ID
   * @returns {Promise<Array>} - Students in the class
   */
  getByClassId: async (classId) => {
    try {
      const response = await api.get(`/admin/students?classId=${classId}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching students by class:', error);
      return [];
    }
  },

  /**
   * Get students by batch ID
   * @param {number} batchId - Batch ID
   * @returns {Promise<Array>} - Students in the batch
   */
  getByBatchId: async (batchId) => {
    try {
      const response = await api.get(`/admin/students?batchId=${batchId}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching students by batch:', error);
      return [];
    }
  },

  /**
   * Get student by ID
   * @param {number} id - Student ID
   * @returns {Promise<Object|null>} - Student object or null
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/students/${id}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  },

  /**
   * Create new student
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} - Created student
   */
  create: async (studentData) => {
    try {
      const response = await api.post('/admin/students', studentData);
      return response.data.success
        ? {
            student: response.data.data,
            credentials: response.data.credentials || null
          }
        : null;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  /**
   * Update student
   * @param {number} id - Student ID
   * @param {Object} studentData - Updated data
   * @returns {Promise<Object|null>} - Updated student or null
   */
  update: async (id, studentData) => {
    try {
      const response = await api.put(`/admin/students/${id}`, studentData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  /**
   * Delete student
   * @param {number} id - Student ID
   * @returns {Promise<boolean>} - Success status
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/students/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }
};

// ============================================
// TEACHER CRUD OPERATIONS
// ============================================

export const teacherService = {
  /**
   * Get all teachers
   * @returns {Promise<Array>} - All teachers
   */
  getAll: async () => {
    try {
      const response = await api.get('/admin/teachers');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
  },

  /**
   * Get teacher by ID
   * @param {number} id - Teacher ID
   * @returns {Promise<Object|null>} - Teacher object or null
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/teachers/${id}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      return null;
    }
  },

  /**
   * Create new teacher
   * @param {Object} teacherData - Teacher data
   * @returns {Promise<Object>} - Created teacher
   */
  create: async (teacherData) => {
    try {
      const response = await api.post('/admin/teachers', teacherData);
      return response.data.success
        ? {
            teacher: response.data.data,
            credentials: response.data.credentials || null
          }
        : null;
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  /**
   * Update teacher
   * @param {number} id - Teacher ID
   * @param {Object} teacherData - Updated data
   * @returns {Promise<Object|null>} - Updated teacher or null
   */
  update: async (id, teacherData) => {
    try {
      const response = await api.put(`/admin/teachers/${id}`, teacherData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  },

  /**
   * Delete teacher
   * @param {number} id - Teacher ID
   * @returns {Promise<boolean>} - Success status
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/teachers/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  }
};

// ============================================
// CLASSROOM OPERATIONS
// ============================================

export const classroomService = {
  getAll: async () => {
    try {
      const response = await api.get('/classrooms');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      return [];
    }
  },

  create: async (classroomData) => {
    try {
      const response = await api.post('/classrooms', classroomData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  }
};

// ============================================
// SUBJECT CRUD OPERATIONS
// ============================================

export const subjectService = {
  /**
   * Get all subjects
   * @returns {Promise<Array>} - All subjects
   */
  getAll: async () => {
    try {
      const response = await api.get('/admin/subjects');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  },

  /**
   * Get subjects by class ID
   * @param {number} classId - Class ID
   * @returns {Promise<Array>} - Subjects for the class
   */
  getByClassId: async (classId) => {
    try {
      if (!classId) return [];
      
      const response = await api.get(`/admin/subjects/class/${classId}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching subjects by class:', error);
      return [];
    }
  },

  /**
   * Get subjects by teacher ID
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Array>} - Subjects taught by teacher
   */
  getByTeacherId: async (teacherId) => {
    try {
      const response = await api.get(`/admin/subjects?teacherId=${teacherId}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching subjects by teacher:', error);
      return [];
    }
  },

  /**
   * Get subject by ID
   * @param {number} id - Subject ID
   * @returns {Promise<Object|null>} - Subject object or null
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/subjects/${id}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching subject:', error);
      return null;
    }
  },

  /**
   * Create new subject
   * @param {Object} subjectData - Subject data
   * @returns {Promise<Object>} - Created subject
   */
  create: async (subjectData) => {
    try {
      const response = await api.post('/admin/subjects', subjectData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  },

  /**
   * Update subject
   * @param {number} id - Subject ID
   * @param {Object} subjectData - Updated data
   * @returns {Promise<Object|null>} - Updated subject or null
   */
  update: async (id, subjectData) => {
    try {
      const response = await api.put(`/admin/subjects/${id}`, subjectData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  /**
   * Delete subject
   * @param {number} id - Subject ID
   * @returns {Promise<boolean>} - Success status
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/subjects/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }
};

// ============================================
// ADMIN IMPORT OPERATIONS
// ============================================

export const adminImportService = {
  /**
   * Import entity records from a CSV or XML file
   * @param {string} entity - Supported entity key
   * @param {File} file - File selected in the browser
   * @returns {Promise<Object>} - Import summary
   */
  importData: async (entity, file) => {
    try {
      const content = await file.text();
      const response = await api.post(`/admin/import/${entity}`, {
        fileName: file.name,
        content
      });

      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error(`Error importing ${entity}:`, error);
      throw error;
    }
  }
};

// ============================================
// ATTENDANCE CRUD OPERATIONS
// ============================================

export const attendanceService = {
  /**
   * Get all attendance records for a subject
   * @param {number} subjectId - Subject ID
   * @param {Object} params - Query params: date, type, batchId, startDate, endDate
   * @returns {Promise<Object>} - { subject, attendance, summary }
   */
  getBySubjectId: async (subjectId, params = {}) => {
    try {
      const response = await api.get(`/teacher/attendance/${subjectId}`, { params });
      return response.data.success ? response.data.data : { subject: null, attendance: [], summary: {} };
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return { subject: null, attendance: [], summary: {} };
    }
  },

  /**
   * Get teacher's assigned subjects
   * @returns {Promise<Array>} - Assigned subjects
   */
  getMySubjects: async () => {
    try {
      const response = await api.get('/teacher/my-subjects');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching assigned subjects:', error);
      return [];
    }
  },

  /**
   * Get students for attendance marking
   * @param {number} subjectId - Subject ID
   * @param {Object} params - Query params: type (theory/lab), batchId (for lab)
   * @returns {Promise<Object>} - { subject, students }
   */
  getStudentsForAttendance: async (subjectId, params = {}) => {
    try {
      const response = await api.get(`/teacher/students/${subjectId}`, { params });
      return response.data.success ? response.data.data : { subject: null, students: [] };
    } catch (error) {
      console.error('Error fetching students for attendance:', error);
      return { subject: null, students: [] };
    }
  },

  /**
   * Get slot context with merged students + attendance status
   * @param {number} slotId - Lecture slot ID
   * @param {string} date - Attendance date (YYYY-MM-DD)
   * @returns {Promise<Object>} - { slotDetails, students[] }
   */
  getSlotAttendanceContext: async (slotId, date) => {
    try {
      const response = await api.get(`/attendance/slots/${slotId}/context`, {
        params: { date }
      });
      return response.data.success
        ? response.data.data
        : { slotDetails: null, students: [] };
    } catch (error) {
      console.error('Error fetching slot attendance context:', error);
      return { slotDetails: null, students: [] };
    }
  },

  /**
   * Get batches for a subject
   * @param {number} subjectId - Subject ID
   * @returns {Promise<Array>} - Batches
   */
  getBatchesForSubject: async (subjectId) => {
    try {
      const response = await api.get(`/teacher/batches/${subjectId}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching batches for subject:', error);
      return [];
    }
  },

  /**
   * Get student's own attendance
   * @returns {Promise<Array>} - Student's attendance
   */
  getMyAttendance: async () => {
    try {
      const response = await api.get('/student/attendance');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching my attendance:', error);
      return [];
    }
  },

  /**
   * Get student dashboard data
   * @returns {Promise<Object>} - Dashboard data
   */
  getStudentDashboard: async () => {
    try {
      const response = await api.get('/student/dashboard');
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
      return null;
    }
  },

  /**
   * Mark attendance
   * @param {Object} attendanceData - Attendance data with records array
   * @returns {Promise<Object>} - Created attendance
   */
  markAttendance: async (attendanceData) => {
    try {
      const response = await api.post('/teacher/attendance', attendanceData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  /**
   * Bulk save attendance using slot context
   * @param {number} slotId
   * @param {Object} payload - { date, attendance[] }
   * @returns {Promise<Object|null>}
   */
  saveSlotAttendance: async (slotId, payload) => {
    try {
      const response = await api.post(`/attendance/slots/${slotId}/save`, payload);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error marking slot attendance:', error);
      throw error;
    }
  },

  /**
   * Get attendance report for a subject
   * @param {number} subjectId - Subject ID
   * @returns {Promise<Object>} - Report data
   */
  getReport: async (subjectId) => {
    try {
      const response = await api.get(`/teacher/reports/${subjectId}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      return null;
    }
  },

  /**
   * Get subject-specific attendance for student
   * @param {number} subjectId - Subject ID
   * @returns {Promise<Array>} - Attendance records
   */
  getSubjectAttendance: async (subjectId) => {
    try {
      const response = await api.get(`/student/attendance/${subjectId}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching subject attendance:', error);
      return [];
    }
  }
};

// ============================================
// LECTURE SLOT OPERATIONS
// ============================================

export const lectureSlotService = {
  getAll: async () => {
    try {
      const response = await api.get('/teacher/lecture-slots');
      return response.data.success ? response.data : { data: [], timetable: {} };
    } catch (error) {
      console.error('Error fetching lecture slots:', error);
      return { data: [], timetable: {} };
    }
  },

  getCurrent: async () => {
    try {
      const response = await api.get('/teacher/lecture-slots/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching current slot:', error);
      return { success: false, data: null, message: 'Error detecting current lecture' };
    }
  },

  create: async (slotData) => {
    try {
      const response = await api.post('/teacher/lecture-slots', slotData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error creating lecture slot:', error);
      throw error;
    }
  },

  update: async (id, slotData) => {
    try {
      const response = await api.put(`/teacher/lecture-slots/${id}`, slotData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error updating lecture slot:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/teacher/lecture-slots/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting lecture slot:', error);
      throw error;
    }
  }
};

// ============================================
// PROXY LECTURE OPERATIONS
// ============================================

export const proxyService = {
  getFacultyOptions: async () => {
    try {
      const response = await api.get('/teacher/proxy/faculty-options');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching proxy faculty options:', error);
      return [];
    }
  },

  createRequest: async (payload) => {
    try {
      const response = await api.post('/teacher/proxy/request', payload);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error creating proxy request:', error);
      throw error;
    }
  },

  getMyRequests: async () => {
    try {
      const response = await api.get('/teacher/proxy/my-requests');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching my proxy requests:', error);
      return [];
    }
  },

  getHodRequests: async () => {
    try {
      const response = await api.get('/teacher/proxy/hod-requests');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching HOD proxy requests:', error);
      return [];
    }
  },

  updateStatus: async (requestId, status) => {
    try {
      const response = await api.put(`/teacher/proxy/update-status/${requestId}`, { status });
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error updating proxy request status:', error);
      throw error;
    }
  },

  getMyProxyLectures: async () => {
    try {
      const response = await api.get('/teacher/proxy/my-lectures');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching my proxy lectures:', error);
      return [];
    }
  },

  getSuggestions: async (slotId, date) => {
    try {
      const response = await api.get('/teacher/proxy/suggestions', {
        params: { slotId, date }
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching proxy suggestions:', error);
      return [];
    }
  }
};

// ============================================
// TIMETABLE OPERATIONS
// ============================================

export const timetableService = {
  getStudentTimetable: async () => {
    try {
      const response = await api.get('/timetable/student');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching student timetable:', error);
      return [];
    }
  },

  getTeacherTimetable: async (date) => {
    try {
      const response = await api.get('/timetable/teacher', {
        params: { date }
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching teacher timetable:', error);
      return [];
    }
  }
};

// ============================================
// LEAVE APPLICATION OPERATIONS
// ============================================

export const leaveService = {
  // Student methods
  apply: async (leaveData) => {
    try {
      const response = await api.post('/student/leave', leaveData);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error applying for leave:', error);
      throw error;
    }
  },

  getMyLeaves: async () => {
    try {
      const response = await api.get('/student/leave');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching my leaves:', error);
      return [];
    }
  },

  // Teacher methods
  getLeaveRequests: async (params = {}) => {
    try {
      const response = await api.get('/teacher/leave-requests', { params });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }
  },

  reviewLeave: async (id, reviewData) => {
    try {
      const response = await api.put(`/teacher/leave-requests/${id}`, reviewData);
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error reviewing leave:', error);
      throw error;
    }
  },

  // Admin methods
  getAdminLeaveRequests: async (params = {}) => {
    try {
      const response = await api.get('/admin/reports/leave-requests', { params });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching admin leave requests:', error);
      return [];
    }
  },

  adminReviewLeave: async (id, reviewData) => {
    try {
      const response = await api.put(`/admin/reports/leave-requests/${id}`, reviewData);
      return response.data.success ? response.data : null;
    } catch (error) {
      console.error('Error reviewing leave:', error);
      throw error;
    }
  }
};

// ============================================
// DASHBOARD STATISTICS
// ============================================

/**
 * Get dashboard statistics for admin
 * @returns {Promise<Object>} - Dashboard stats
 */
export const getDashboardStats = async () => {
  try {
    // Fetch all counts in parallel
    const [classes, batches, students, teachers, subjects] = await Promise.all([
      classService.getAll(),
      batchService.getAll(),
      studentService.getAll(),
      teacherService.getAll(),
      subjectService.getAll()
    ]);

    return {
      totalClasses: classes.length,
      totalBatches: batches.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalSubjects: subjects.length
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalClasses: 0,
      totalBatches: 0,
      totalStudents: 0,
      totalTeachers: 0,
      totalSubjects: 0
    };
  }
};

/**
 * Reset all data - Not applicable for API-based service
 * @deprecated Use backend seeder instead
 */
export const resetAllData = () => {
  console.warn('resetAllData is deprecated. Use backend seeder to reset data.');
  return false;
};
