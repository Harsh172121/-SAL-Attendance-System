/**
 * SAL Education - College Attendance Management System
 * Pages Index
 * Exports all pages for easy importing
 */

// Common pages
export { default as Login } from './Login';
export { default as Profile } from './Profile';
export { default as Unauthorized } from './Unauthorized';
export { default as NotFound } from './NotFound';

// Admin pages
export * from './admin';

// Teacher pages
export * from './teacher';

// Student pages
export * from './student';

// Handle conflicting names or provide specific aliases if needed
// (Timetable is exported by both teacher and student, so we need to be explicit)
export { Timetable as TeacherTimetable } from './teacher';
export { Timetable as StudentTimetable } from './student';
