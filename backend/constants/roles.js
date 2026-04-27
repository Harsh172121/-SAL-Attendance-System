const TEACHER_PRIORITIES = ['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'CLASS_COORDINATOR'];
const ELEVATED_PRIORITIES = ['ADMIN', 'PRINCIPAL', 'HOD'];
const LEAVE_REVIEW_PRIORITIES = ['ADMIN', 'PRINCIPAL', 'HOD', 'CLASS_COORDINATOR'];
const LEAVE_TARGETS = ['CLASS_COORDINATOR', 'HOD', 'BOTH'];

const isElevatedPriority = (priority) => ELEVATED_PRIORITIES.includes(priority);
const canReviewLeaves = (priority) => LEAVE_REVIEW_PRIORITIES.includes(priority);

module.exports = {
  TEACHER_PRIORITIES,
  ELEVATED_PRIORITIES,
  LEAVE_REVIEW_PRIORITIES,
  LEAVE_TARGETS,
  isElevatedPriority,
  canReviewLeaves
};
