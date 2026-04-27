export const TEACHER_PRIORITIES = ['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'CLASS_COORDINATOR'];
export const ELEVATED_PRIORITIES = ['ADMIN', 'PRINCIPAL', 'HOD'];
export const LEAVE_REVIEW_PRIORITIES = ['ADMIN', 'PRINCIPAL', 'HOD', 'CLASS_COORDINATOR'];
export const LEAVE_TARGETS = ['CLASS_COORDINATOR', 'HOD', 'BOTH'];

export const TEACHER_PRIORITY_OPTIONS = [
  { value: 'FACULTY', label: 'Faculty' },
  { value: 'CLASS_COORDINATOR', label: 'Class Coordinator' },
  { value: 'HOD', label: 'HOD (Head of Department)' },
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'ADMIN', label: 'Admin' }
];

export const LEAVE_TARGET_OPTIONS = [
  { value: 'BOTH', label: 'Both (Default)' },
  { value: 'CLASS_COORDINATOR', label: 'Class Coordinator' },
  { value: 'HOD', label: 'HOD' }
];

export const LEAVE_TARGET_LABELS = {
  CLASS_COORDINATOR: 'Class Coordinator',
  HOD: 'HOD',
  BOTH: 'Both'
};

export const formatTeacherPriority = (priority = 'FACULTY') => priority.replace(/_/g, ' ');

export const canTeacherReviewLeaves = (user) =>
  user?.role === 'teacher' && LEAVE_REVIEW_PRIORITIES.includes(user?.priority);
