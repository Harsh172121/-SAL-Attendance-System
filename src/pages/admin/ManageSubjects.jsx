/**
 * SAL Education - College Attendance Management System
 * Manage Subjects Page
 * 
 * Complete CRUD for subject management with faculty assignment.
 * Subject types: Theory, Lab, or Theory+Lab
 * 
 * VIVA NOTE: Subjects can have different teachers for theory and lab.
 * Lab subjects enable batch-wise attendance marking.
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, Button, Table, Modal, Input, Select, ConfirmDialog, DataImportCard } from '../../components';
import { subjectService, classService, teacherService } from '../../services/dataService';
import { importConfigs } from '../../constants/importConfigs';
import { formatTeacherDepartments } from '../../utils/teacherDepartments';

const ManageSubjects = () => {
  const getAssignedTeacherIds = (subject, type) => {
    const idField = type === 'theory' ? 'theoryFacultyId' : 'labFacultyId';
    const idsField = type === 'theory' ? 'theoryFacultyIds' : 'labFacultyIds';

    return [...new Set([
      ...(Array.isArray(subject?.[idsField]) ? subject[idsField] : []),
      subject?.[idField]
    ]
      .filter(Boolean)
      .map(id => id.toString()))];
  };

  const getTeacherNamesByIds = (teacherIds, teacherList) => teacherIds
    .map(id => teacherList.find(teacher => teacher.id === Number(id))?.name)
    .filter(Boolean);

  // State
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });
  const [editingId, setEditingId] = useState(null);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    classId: '',
    type: '',
    searchTerm: ''
  });
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '',
    classId: '',
    theoryFacultyIds: [],
    labFacultyIds: [],
    credits: ''
  });

  // Subject type options
  const typeOptions = [
    { value: 'theory', label: 'Theory Only' },
    { value: 'lab', label: 'Lab Only' },
    { value: 'theory+lab', label: 'Theory + Lab' }
  ];

  // Credit options
  const creditOptions = [1, 2, 3, 4, 5].map(c => ({
    value: c.toString(),
    label: `${c} Credits`
  }));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [subjectsData, classesData, teachersData] = await Promise.all([
      subjectService.getAll(),
      classService.getAll(),
      teacherService.getAll()
    ]);
    // Enrich subjects with class and teacher names
    const enrichedSubjects = subjectsData.map(subject => ({
      ...subject,
      classNames: (subject.classes || []).map(c => c.name).join(', ') || 'N/A',
      theoryFacultyIds: getAssignedTeacherIds(subject, 'theory'),
      labFacultyIds: getAssignedTeacherIds(subject, 'lab'),
      theoryTeacherNames: getTeacherNamesByIds(getAssignedTeacherIds(subject, 'theory'), teachersData),
      labTeacherNames: getTeacherNamesByIds(getAssignedTeacherIds(subject, 'lab'), teachersData)
    }));
    setSubjects(enrichedSubjects);
    setClasses(classesData);
    setTeachers(teachersData);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === 'type') {
      setFormData(prev => ({
        ...prev,
        type: value,
        theoryFacultyIds: value === 'lab' ? [] : prev.theoryFacultyIds,
        labFacultyIds: value === 'theory' ? [] : prev.labFacultyIds
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAdd = () => {
    setFormData({
      code: '',
      name: '',
      type: '',
      classIds: [],
      theoryFacultyIds: [],
      labFacultyIds: [],
      credits: ''
    });
    setEditingId(null);
    setSelectedClassIds([]);
    setIsModalOpen(true);
  };

  const handleEdit = (subject) => {
    setFormData({
      code: subject.code,
      name: subject.name,
      type: subject.type,
      classIds: subject.classIds || [],
      theoryFacultyIds: getAssignedTeacherIds(subject, 'theory'),
      labFacultyIds: getAssignedTeacherIds(subject, 'lab'),
      credits: subject.credits.toString()
    });
    setEditingId(subject.id);
    setSelectedClassIds(subject.classIds || []);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (subject) => {
    setDeleteDialog({ isOpen: true, item: subject });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.item) {
      await subjectService.delete(deleteDialog.item.id);
      await loadData();
      toast.success('Subject deleted successfully!');
    }
  };

  const toggleClassSelection = (classId) => {
    setSelectedClassIds(prev =>
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const toggleTeacherSelection = (field, teacherId) => {
    const teacherValue = teacherId.toString();

    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(teacherValue)
        ? prev[field].filter(id => id !== teacherValue)
        : [...prev[field], teacherValue]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.code || !formData.name || !formData.type || !formData.credits) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Class validation
    if (selectedClassIds.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    // Validate teacher assignment based on type
    if ((formData.type === 'theory' || formData.type === 'theory+lab') && formData.theoryFacultyIds.length === 0) {
      toast.error('Please assign at least one theory teacher');
      return;
    }
    if ((formData.type === 'lab' || formData.type === 'theory+lab') && formData.labFacultyIds.length === 0) {
      toast.error('Please assign at least one lab teacher');
      return;
    }

    const payload = {
      code: formData.code,
      name: formData.name,
      type: formData.type,
      credits: formData.credits,
      classIds: selectedClassIds,
      theoryFacultyIds: formData.type !== 'lab' ? formData.theoryFacultyIds.map(id => parseInt(id, 10)) : [],
      labFacultyIds: formData.type !== 'theory' ? formData.labFacultyIds.map(id => parseInt(id, 10)) : []
    };

    try {
      if (editingId) {
        await subjectService.update(editingId, payload);
        toast.success('Subject updated successfully!');
      } else {
        await subjectService.create(payload);
        toast.success('Subject created successfully!');
      }

      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed. Please try again.');
    }
  };

  // Options for dropdowns
  const classOptions = classes.map(c => ({
    value: c.id.toString(),
    label: `${c.name} - ${c.department}`
  }));

  const activeTeachers = teachers.filter(teacher => teacher.isActive !== false);

  // Apply filters
  let displaySubjects = subjects;
  if (filters.classId) {
    displaySubjects = displaySubjects.filter(s => (s.classIds || []).includes(parseInt(filters.classId)));
  }
  if (filters.type) {
    displaySubjects = displaySubjects.filter(s => s.type === filters.type);
  }
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    displaySubjects = displaySubjects.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term)
    );
  }

  // Table columns
  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Subject Name' },
    { 
      key: 'type', 
      label: 'Type',
      render: (value) => {
        const colors = {
          'theory': 'bg-blue-100 text-blue-800',
          'lab': 'bg-green-100 text-green-800',
          'theory+lab': 'bg-purple-100 text-purple-800'
        };
        const labels = {
          'theory': 'Theory',
          'lab': 'Lab',
          'theory+lab': 'Theory + Lab'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value]}`}>
            {labels[value]}
          </span>
        );
      }
    },
    { key: 'classNames', label: 'Classes' },
    {
      key: 'theoryTeacherNames',
      label: 'Theory Teacher(s)',
      render: (value) => (
        <div className="max-w-xs whitespace-normal">
          {value?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map((teacherName, index) => (
                <span
                  key={`${teacherName}-${index}`}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                >
                  {teacherName}
                </span>
              ))}
            </div>
          ) : '-'}
        </div>
      )
    },
    {
      key: 'labTeacherNames',
      label: 'Lab Teacher(s)',
      render: (value) => (
        <div className="max-w-xs whitespace-normal">
          {value?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map((teacherName, index) => (
                <span
                  key={`${teacherName}-${index}`}
                  className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800"
                >
                  {teacherName}
                </span>
              ))}
            </div>
          ) : '-'}
        </div>
      )
    },
    { 
      key: 'credits', 
      label: 'Credits',
      render: (value) => `${value} Cr`
    }
  ];

  // Check if theory/lab fields should be shown based on type
  const showTheory = formData.type === 'theory' || formData.type === 'theory+lab';
  const showLab = formData.type === 'lab' || formData.type === 'theory+lab';

  const renderTeacherSelector = (field, label, selectedIds, colorClasses) => (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="border border-gray-300 rounded-lg p-3 max-h-56 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
        {activeTeachers.map((teacher) => {
          const isSelected = selectedIds.includes(teacher.id.toString());

          return (
            <label
              key={`${field}-${teacher.id}`}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                isSelected ? colorClasses.selected : 'hover:bg-gray-50 border-transparent'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleTeacherSelection(field, teacher.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">{teacher.name}</p>
                <p className="text-xs text-gray-500">{formatTeacherDepartments(teacher)}</p>
                <p className="text-xs text-gray-400">{teacher.employeeId}</p>
              </div>
            </label>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {selectedIds.length > 0
          ? `${selectedIds.length} teacher${selectedIds.length > 1 ? 's' : ''} selected`
          : 'No teacher selected'}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Subjects</h1>
          <p className="text-gray-600">Add subjects and assign faculty</p>
        </div>
        <Button onClick={handleAdd}>
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Subject
          </span>
        </Button>
      </div>

      <DataImportCard
        config={importConfigs.subjects}
        onImported={loadData}
      />

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Input
            id="searchTerm"
            placeholder="Search by name or code..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
          <Select
            id="filterClass"
            value={filters.classId}
            onChange={(e) => setFilters(prev => ({ ...prev, classId: e.target.value }))}
            options={classOptions}
            placeholder="All Classes"
          />
          <Select
            id="filterType"
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            options={typeOptions}
            placeholder="All Types"
          />
          <div className="text-sm text-gray-500 flex items-center justify-end">
            Showing {displaySubjects.length} subjects
          </div>
        </div>
      </Card>

      {/* Subjects table */}
      <Card>
        <Table
          columns={columns}
          data={displaySubjects}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No subjects found. Click 'Add Subject' to create one."
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Subject' : 'Add New Subject'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Subject Code"
              id="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., CS501, IT502"
              required
            />
            <Input
              label="Subject Name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Database Management"
              required
            />
            <Select
              label="Subject Type"
              id="type"
              value={formData.type}
              onChange={handleInputChange}
              options={typeOptions}
              placeholder="Select type"
              required
            />
            {/* Multi-class picker */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Classes <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                {classes.filter(c => c.isActive !== false).map(c => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors border ${
                      selectedClassIds.includes(c.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50 border-transparent'
                    } cursor-pointer`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClassIds.includes(c.id)}
                      onChange={() => toggleClassSelection(c.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 font-medium truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{c.department}</p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {selectedClassIds.length > 0 
                  ? `${selectedClassIds.length} class${selectedClassIds.length > 1 ? 'es' : ''} selected` 
                  : 'No class selected'}
              </p>
            </div>
            
            {/* Conditionally show theory teacher based on type */}
            {showTheory && (
              renderTeacherSelector(
                'theoryFacultyIds',
                'Theory Teacher(s)',
                formData.theoryFacultyIds,
                {
                  selected: 'bg-blue-50 border-blue-300'
                }
              )
            )}
            
            {/* Conditionally show lab teacher based on type */}
            {showLab && (
              renderTeacherSelector(
                'labFacultyIds',
                'Lab Teacher(s)',
                formData.labFacultyIds,
                {
                  selected: 'bg-purple-50 border-purple-300'
                }
              )
            )}
            
            <Select
              label="Credits"
              id="credits"
              value={formData.credits}
              onChange={handleInputChange}
              options={creditOptions}
              placeholder="Select credits"
              required
            />
          </div>

          {/* Info about lab subjects */}
          {showLab && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <strong>Note:</strong> Lab subjects enable batch-wise attendance marking. 
              Make sure batches are created for the selected class.
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? 'Update Subject' : 'Add Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteDialog.item?.name}"? This will also delete all attendance records for this subject.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ManageSubjects;
