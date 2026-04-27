/**
 * SAL Education - Leave Application Routes
 * 
 * Routes for student leave applications and faculty/admin review.
 * VIVA NOTE: 
 * - Student routes: apply for leave, view own leave status
 * - Teacher routes: view leave requests, approve/reject
 * - Admin routes: view all leave requests, approve/reject
 */

const express = require('express');

// Student leave routes
const studentRouter = express.Router();
const { protect, studentOnly, teacherOnly, adminOnly, teacherLeaveReviewerOnly } = require('../middleware');
const {
  applyLeave,
  getMyLeaves,
  getLeaveRequests,
  reviewLeave,
  getAdminLeaveRequests,
  adminReviewLeave
} = require('../controllers/leaveApplicationController');

// --- Student Routes ---
studentRouter.use(protect);
studentRouter.use(studentOnly);
studentRouter.post('/', applyLeave);
studentRouter.get('/', getMyLeaves);

// --- Teacher Routes ---
const teacherRouter = express.Router();
teacherRouter.use(protect);
teacherRouter.use(teacherOnly);
teacherRouter.use(teacherLeaveReviewerOnly);
teacherRouter.get('/', getLeaveRequests);
teacherRouter.put('/:id', reviewLeave);

// --- Admin Routes ---
const adminRouter = express.Router();
adminRouter.use(protect);
adminRouter.use(adminOnly);
adminRouter.get('/', getAdminLeaveRequests);
adminRouter.put('/:id', adminReviewLeave);

module.exports = { studentRouter, teacherRouter, adminRouter };
