/**
 * Teacher Timetable Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimetableGrid, Card, Button } from '../../components';
import { timetableService } from '../../services/dataService';
import { toast } from 'react-toastify';

const TeacherTimetable = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchTimetable = async (date) => {
    setLoading(true);
    try {
      const data = await timetableService.getTeacherTimetable(date);
      setSlots(data || []);
    } catch {
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable(selectedDate);
  }, [selectedDate]);

  const handleSlotClick = (slot) => {
    const date = slot.isProxy ? slot.originalDate : selectedDate;
    navigate(
      `/teacher/mark-attendance?subjectId=${slot.subjectId}&classId=${slot.classId}&slotId=${slot.id}&date=${date}&type=${slot.type}${slot.batchId ? `&batchId=${slot.batchId}` : ''}&subjectName=${encodeURIComponent(slot.subject?.name || '')}&subjectCode=${encodeURIComponent(slot.subject?.code || '')}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Teaching Schedule</h1>
          <p className="text-gray-600">Weekly view of your lectures and assigned proxies</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">View for Date:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-blue-900">How to use</h4>
            <p className="text-sm text-blue-800">
              Click on any lecture slot in the grid to quickly jump to the attendance marking page for that specific lecture. 
              Proxy lectures are highlighted in <span className="font-bold text-yellow-700">yellow</span>.
            </p>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        </div>
      ) : (
        <TimetableGrid 
          slots={slots} 
          onSlotClick={handleSlotClick} 
          title={`Timetable for Week of ${new Date(selectedDate).toLocaleDateString()}`}
        />
      )}
    </div>
  );
};

export default TeacherTimetable;
