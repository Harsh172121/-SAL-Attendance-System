/**
 * SAL Education - Middleware Index
 * 
 * Centralized export of all middleware functions.
 */

const { protect, generateToken } = require('./authMiddleware');
const {
  authorize,
  adminOnly,
  teacherOnly,
  hodOnly,
  studentOnly,
  adminOrElevated,
  teacherLeaveReviewerOnly
} = require('./roleMiddleware');

module.exports = {
  protect,
  generateToken,
  authorize,
  adminOnly,
  teacherOnly,
  hodOnly,
  studentOnly,
  adminOrElevated,
  teacherLeaveReviewerOnly
};
