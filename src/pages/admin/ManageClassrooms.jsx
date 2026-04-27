/**
 * SAL Education - Manage Classrooms Page
 *
 * Adds classroom numbers and lists available classrooms for timetable use.
 */

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Card, Button, Table, Input } from '../../components';
import { classroomService } from '../../services/dataService';

const ManageClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomNumber, setClassroomNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadClassrooms = async () => {
    setLoading(true);
    const data = await classroomService.getAll();
    setClassrooms(data);
    setLoading(false);
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!classroomNumber) {
      toast.error('Please enter a classroom number');
      return;
    }

    try {
      setSubmitting(true);
      await classroomService.create({ classroomNumber: parseInt(classroomNumber, 10) });
      setClassroomNumber('');
      await loadClassrooms();
      toast.success('Classroom added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding classroom');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'classroomNumber', label: 'Classroom Number' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manage Classrooms</h1>
        <p className="text-gray-600">Add classroom numbers for timetable allocation</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-end">
          <Input
            label="Classroom Number"
            id="classroomNumber"
            type="number"
            min="1"
            value={classroomNumber}
            onChange={(e) => setClassroomNumber(e.target.value)}
            placeholder="e.g., 101"
            required
            className="flex-1"
          />
          <Button type="submit" disabled={submitting} className="md:min-w-[180px]">
            {submitting ? 'Adding...' : 'Add Classroom'}
          </Button>
        </form>
      </Card>

      <Card>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-800"></div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between text-sm text-gray-500">
              <span>Classroom List</span>
              <span>Total: {classrooms.length}</span>
            </div>
            <Table
              columns={columns}
              data={classrooms}
              showActions={false}
              emptyMessage="No classrooms added yet. Add a classroom number to begin."
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default ManageClassrooms;
