/**
 * SAL Education - College Attendance Management System
 * Components Index
 * Exports all reusable components for easy importing
 * 
 * VIVA NOTE: Barrel exports allow clean imports like:
 * import { Button, Card, Modal } from './components';
 */

// Layout components
export { default as Navbar } from './Navbar';
export { default as Sidebar } from './Sidebar';
export { default as TimetableGrid } from './TimetableGrid';
export { default as Layout } from './Layout';
export { default as ProtectedRoute } from './ProtectedRoute';

// UI components
export { default as Card } from './Card';
export { default as Button } from './Button';
export { default as Modal } from './Modal';
export { default as Table } from './Table';
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as StatsCard } from './StatsCard';
export { default as DataImportCard } from './DataImportCard';

// Form components
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as TimeInput } from './TimeInput';
