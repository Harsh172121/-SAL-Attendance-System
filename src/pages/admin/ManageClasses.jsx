/**
 * SAL Education - College Attendance Management System
 * Manage Classes Page
 * 
 * Full CRUD operations for class management.
 * Features:
 * - View all classes in a table
 * - Add new class with modal form
 * - Edit existing class
 * - Delete class with confirmation
 * 
 * VIVA NOTE: This page demonstrates complete CRUD pattern
 * with state management and localStorage persistence.
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, Button, Table, Modal, Input, Select, ConfirmDialog, DataImportCard } from '../../components';
import { classService, teacherService } from '../../services/dataService';
import { importConfigs } from '../../constants/importConfigs';
import { teacherHandlesDepartment } from '../../utils/teacherDepartments';

const ManageClasses = () => {
  // State for classes data
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });
  // State for form data (used for both add and edit)
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    semester: '',
    classCoordinatorId: ''
  });
  // State to track if editing
  const [editingId, setEditingId] = useState(null);
  // Search/filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Department options for dropdown
  const departmentOptions = [
    { value: 'Computer Engineering', label: 'Computer Engineering' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Electronics Engineering', label: 'Electronics Engineering' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
  ];

  // Semester options
  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8].map(s => ({
    value: s.toString(),
    label: `Semester ${s}`
  }));

  /**
   * Load classes on component mount
   */
  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  /**
   * Fetch all classes from data service
   */
  const loadClasses = async () => {
    const data = await classService.getAll();
    setClasses(data);
  };

  const loadTeachers = async () => {
    const data = await teacherService.getAll();
    setTeachers(data);
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
      ...(id === 'department' ? { classCoordinatorId: '' } : {})
    }));
  };

  /**
   * Open modal for adding new class
   */
  const handleAdd = () => {
    setFormData({ name: '', department: '', semester: '', classCoordinatorId: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  /**
   * Open modal for editing existing class
   */
  const handleEdit = (classItem) => {
    setFormData({
      name: classItem.name,
      department: classItem.department,
      semester: classItem.semester.toString(),
      classCoordinatorId: classItem.classCoordinatorId ? classItem.classCoordinatorId.toString() : ''
    });
    setEditingId(classItem.id);
    setIsModalOpen(true);
  };

  /**
   * Open delete confirmation dialog
   */
  const handleDeleteClick = (classItem) => {
    setDeleteDialog({ isOpen: true, item: classItem });
  };

  /**
   * Confirm delete action
   */
  const handleDeleteConfirm = async () => {
    if (deleteDialog.item) {
      await classService.delete(deleteDialog.item.id);
      await loadClasses();
      toast.success('Class deleted successfully!');
    }
  };

  /**
   * Handle form submission (create or update)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.department || !formData.semester) {
      toast.error('Please fill in all required fields');
      return;
    }

    const classData = {
      name: formData.name,
      department: formData.department,
      semester: parseInt(formData.semester),
      classCoordinatorId: formData.classCoordinatorId ? parseInt(formData.classCoordinatorId) : null
    };

    try {
      if (editingId) {
        // Update existing class
        await classService.update(editingId, classData);
        toast.success('Class updated successfully!');
      } else {
        // Create new class
        await classService.create(classData);
        toast.success('Class created successfully!');
      }

      // Close modal and refresh list
      setIsModalOpen(false);
      await loadClasses();
    } catch (error) {
      toast.error('Operation failed. Please try again.');
    }
  };

  // Filter classes based on search term
  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const coordinatorOptions = teachers
    .filter((teacher) =>
      teacher.priority === 'CLASS_COORDINATOR' &&
      teacher.isActive &&
      teacherHandlesDepartment(teacher, formData.department)
    )
    .map((teacher) => ({
      value: teacher.id.toString(),
      label: `${teacher.name} (${teacher.employeeId})`
    }));

  // Table column definitions
  const columns = [
    { key: 'name', label: 'Class Name' },
    { key: 'department', label: 'Department' },
    { 
      key: 'semester', 
      label: 'Semester',
      render: (value) => `Semester ${value}`
    },
    {
      key: 'classCoordinatorId',
      label: 'Class Coordinator',
      render: (_, row) => row.classCoordinator?.name || 'Unassigned'
    },
    { key: 'createdAt', label: 'Created Date' }
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Classes</h1>
          <p className="text-gray-600">Create and manage class divisions</p>
        </div>
        <Button onClick={handleAdd}>
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Class
          </span>
        </Button>
      </div>

      <DataImportCard
        config={importConfigs.classes}
        onImported={loadClasses}
      />

      {/* Search and filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              id="search"
              placeholder="Search by class name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            Total: {filteredClasses.length} classes
          </div>
        </div>
      </Card>

      {/* Classes table */}
      <Card>
        <Table
          columns={columns}
          data={filteredClasses}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No classes found. Click 'Add Class' to create one."
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Class' : 'Add New Class'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class Name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., CE-5A, IT-6B"
            required
          />
          
          <Select
            label="Department"
            id="department"
            value={formData.department}
            onChange={handleInputChange}
            options={departmentOptions}
            placeholder="Select department"
            required
          />
          
          <Select
            label="Semester"
            id="semester"
            value={formData.semester}
            onChange={handleInputChange}
            options={semesterOptions}
            placeholder="Select semester"
            required
          />

          <Select
            label="Class Coordinator"
            id="classCoordinatorId"
            value={formData.classCoordinatorId}
            onChange={handleInputChange}
            options={coordinatorOptions}
            placeholder={
              formData.department
                ? coordinatorOptions.length > 0
                  ? 'Assign a class coordinator'
                  : 'No class coordinators available'
                : 'Select department first'
            }
            disabled={!formData.department}
          />

          {formData.department && coordinatorOptions.length === 0 && (
            <p className="text-sm text-amber-600">
              No active teacher with the CLASS_COORDINATOR role is available in this department.
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? 'Update Class' : 'Create Class'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Class"
        message={`Are you sure you want to delete "${deleteDialog.item?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ManageClasses;
