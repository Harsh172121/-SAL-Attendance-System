/**
 * Student Timetable Page
 */

import React, { useState, useEffect } from 'react';
import { TimetableGrid, Card } from '../../components';
import { timetableService } from '../../services/dataService';
import { toast } from 'react-toastify';

const StudentTimetable = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const data = await timetableService.getStudentTimetable();
      setSlots(data || []);
    } catch {
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Class Timetable</h1>
        <p className="text-gray-600">Weekly schedule for your class and batch</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        </div>
      ) : slots.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No timetable slots assigned yet</p>
            <p className="text-sm">Please check with your department coordinator.</p>
          </div>
        </Card>
      ) : (
        <TimetableGrid 
          slots={slots} 
          title="Weekly Class Schedule"
        />
      )}
    </div>
  );
};

export default StudentTimetable;
