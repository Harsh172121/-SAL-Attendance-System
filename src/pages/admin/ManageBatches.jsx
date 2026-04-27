/**
 * SAL Education - College Attendance Management System
 * Manage Batches Page
 * 
 * Full CRUD operations for batch management within classes.
 * Batches are used for lab sessions where students are divided into groups.
 * 
 * VIVA NOTE: Batches are linked to classes via classId foreign key.
 * This demonstrates parent-child relationship in data.
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, Button, Table, Modal, Input, Select, ConfirmDialog, DataImportCard } from '../../components';
import { batchService, classService } from '../../services/dataService';
import { importConfigs } from '../../constants/importConfigs';

const ManageBatches = () => {
  // State for batches data
  const [batches, setBatches] = useState([]);
  // State for classes (for dropdown)
  const [classes, setClasses] = useState([]);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    classId: ''
  });
  // Editing state
  const [editingId, setEditingId] = useState(null);
  // Filter state
  const [filterClassId, setFilterClassId] = useState('');

  /**
   * Load data on component mount
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Fetch all batches and classes
   */
  const loadData = async () => {
    const batchData = await batchService.getAll();
    const classData = await classService.getAll();
    
    // Enrich batch data with class names
    const enrichedBatches = batchData.map(batch => ({
      ...batch,
      className: classData.find(c => c.id === batch.classId)?.name || 'N/A'
    }));
    
    setBatches(enrichedBatches);
    setClasses(classData);
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  /**
   * Open modal for adding new batch
   */
  const handleAdd = () => {
    setFormData({ name: '', classId: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  /**
   * Open modal for editing existing batch
   */
  const handleEdit = (batch) => {
    setFormData({
      name: batch.name,
      classId: batch.classId.toString()
    });
    setEditingId(batch.id);
    setIsModalOpen(true);
  };

  /**
   * Open delete confirmation
   */
  const handleDeleteClick = (batch) => {
    setDeleteDialog({ isOpen: true, item: batch });
  };

  /**
   * Confirm delete action
   */
  const handleDeleteConfirm = async () => {
    if (deleteDialog.item) {
      await batchService.delete(deleteDialog.item.id);
      await loadData();
      toast.success('Batch deleted successfully!');
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.classId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const batchData = {
      name: formData.name,
      classId: formData.classId
    };

    try {
      if (editingId) {
        await batchService.update(editingId, batchData);
        toast.success('Batch updated successfully!');
      } else {
        await batchService.create(batchData);
        toast.success('Batch created successfully!');
      }

      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      toast.error('Operation failed. Please try again.');
    }
  };

  // Class options for dropdown
  const classOptions = classes.map(c => ({
    value: c.id.toString(),
    label: `${c.name} - ${c.department}`
  }));

  // Filter batches by class
  const filteredBatches = filterClassId
    ? batches.filter(b => b.classId === parseInt(filterClassId))
    : batches;

  // Table columns
  const columns = [
    { key: 'name', label: 'Batch Name' },
    { key: 'className', label: 'Class' },
    { key: 'createdAt', label: 'Created Date' }
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Batches</h1>
          <p className="text-gray-600">Create batches for lab sessions within classes</p>
        </div>
        <Button onClick={handleAdd}>
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Batch
          </span>
        </Button>
      </div>

      <DataImportCard
        config={importConfigs.batches}
        onImported={loadData}
      />

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-64">
            <Select
              id="filterClass"
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              options={classOptions}
              placeholder="All Classes"
            />
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            Showing {filteredBatches.length} batches
          </div>
        </div>
      </Card>

      {/* Batches table */}
      <Card>
        <Table
          columns={columns}
          data={filteredBatches}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No batches found. Click 'Add Batch' to create one."
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Batch' : 'Add New Batch'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Batch Name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Batch A, Batch B"
            required
          />
          
          <Select
            label="Class"
            id="classId"
            value={formData.classId}
            onChange={handleInputChange}
            options={classOptions}
            placeholder="Select class"
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? 'Update Batch' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Batch"
        message={`Are you sure you want to delete "${deleteDialog.item?.name}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ManageBatches;
