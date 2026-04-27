/**
 * SAL Education - Start Attendance Page (Auto-Detect Lecture)
 * 
 * VIVA NOTE: This page auto-detects the current lecture slot based on
 * the system day and time, then loads the correct subject/class/batch
 * for attendance marking without manual selection.
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, Button } from '../../components';
import { lectureSlotService, attendanceService } from '../../services/dataService';
import { formatTo12Hour } from '../../utils/timeFormat';

const StartAttendance = () => {
  const [currentSlot, setCurrentSlot] = useState(null);
  const [activeSlots, setActiveSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [slotDetails, setSlotDetails] = useState(null);

  useEffect(() => {
    detectCurrentLecture();
  }, []);

  const detectCurrentLecture = async () => {
    setLoading(true);
    setCurrentSlot(null);
    setActiveSlots([]);
    setStudents([]);
    setAttendance({});
    setSlotDetails(null);
    setSubmitted(false);
    setMessage('');

    try {
      const result = await lectureSlotService.getCurrent();

      if (result.requiresSelection && (result.slots || []).length > 0) {
        setActiveSlots(result.slots);
        setMessage(result.message || 'Multiple lecture slots are active right now. Select the correct batch.');
      } else if (result.data) {
        setCurrentSlot(result.data);
        setActiveSlots(result.slots || [result.data]);
        await loadStudents(result.data);
      } else {
        setMessage(result.message || 'No lecture scheduled at this time.');
      }
    } catch (error) {
      setActiveSlots([]);
      setMessage('Error detecting current lecture.');
    }
    setLoading(false);
  };

  const loadStudents = async (slot) => {
    setStudentsLoading(true);
    try {
      const targetDate = new Date().toISOString().split('T')[0];
      const context = await attendanceService.getSlotAttendanceContext(slot.id, targetDate);
      setSlotDetails(context.slotDetails);
      const studentList = context.students || [];
      setStudents(studentList);

      // Prefill from existing attendance, otherwise Not Marked
      const defaultAttendance = {};
      studentList.forEach((s) => {
        const status = (s.attendanceStatus || '').toLowerCase();
        defaultAttendance[s.studentId] = ['present', 'absent'].includes(status) ? status : 'not_marked';
      });
      setAttendance(defaultAttendance);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Error loading student list');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleSlotSelection = async (slot) => {
    setLoading(true);
    setCurrentSlot(slot);
    setStudents([]);
    setAttendance({});
    setSlotDetails(null);
    setSubmitted(false);
    setMessage('');

    try {
      await loadStudents(slot);
    } finally {
      setLoading(false);
    }
  };

  const cycleStatus = (studentId) => {
    setAttendance(prev => {
      const current = prev[studentId];
      const next = current === 'present' ? 'absent' : 'present';
      return { ...prev, [studentId]: next };
    });
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => { updated[s.studentId || s.id] = status; });
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    if (!currentSlot || students.length === 0 || slotDetails?.isLocked) return;
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status
      }));

      await attendanceService.saveSlotAttendance(Number(currentSlot.id), {
        date: today,
        attendance: attendanceData.map((item) => ({
          ...item,
          status: item.status === 'absent' ? 'absent' : 'present'
        }))
      });

      const presentCount = Object.values(attendance).filter(s => s === 'present').length;
      toast.success(`Attendance marked! ${presentCount}/${students.length} present`);
      setSubmitted(true);
      setSlotDetails((prev) => (prev ? { ...prev, isLocked: true } : prev));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error marking attendance');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        <p className="ml-4 text-gray-600">Detecting current lecture...</p>
      </div>
    );
  }

  // No lecture found
  if (!currentSlot) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Start Attendance</h1>
        <Card>
          {activeSlots.length > 0 ? (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-xl text-gray-700 font-semibold">{message}</p>
                <p className="text-gray-500 mt-2">Multiple lab batches are active right now. Select the exact batch before marking attendance.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {activeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelection(slot)}
                    className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:border-blue-400 hover:bg-blue-100"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {slot.subject?.code} - {slot.subject?.name}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {slot.class?.name} {slot.batch ? `• Batch ${slot.batch.name}` : ''}
                        </p>
                      </div>
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold uppercase text-purple-700">
                        {slot.type}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                      {slot.dayOfWeek} • {formatTo12Hour(slot.startTime?.slice(0, 5))} - {formatTo12Hour(slot.endTime?.slice(0, 5))}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={detectCurrentLecture}
                  className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
                >
                  Retry Detection
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl text-gray-500 font-medium">{message}</p>
              <p className="text-gray-400 mt-2">Please check your timetable or try again during a scheduled lecture.</p>
              <Button
                onClick={detectCurrentLecture}
                className="mt-6 px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
              >
                Retry Detection
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const notMarkedCount = Object.values(attendance).filter(s => s === 'not_marked').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Start Attendance</h1>

      {activeSlots.length > 1 && (
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Parallel Lab Batches</h2>
                <p className="text-sm text-gray-500">Switch between the active lab batches below if you need to mark a different batch.</p>
              </div>
              <Button
                onClick={detectCurrentLecture}
                className="px-4 py-2 bg-white text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                Refresh Active Slots
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeSlots.map((slot) => {
                const isSelected = slot.id === currentSlot.id;

                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelection(slot)}
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <p className="font-semibold text-gray-800">
                      {slot.batch ? `Batch ${slot.batch.name}` : slot.class?.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {slot.subject?.code} • {formatTo12Hour(slot.startTime?.slice(0, 5))} - {formatTo12Hour(slot.endTime?.slice(0, 5))}
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-500">
                      {isSelected ? 'Currently selected' : 'Tap to switch'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Current Lecture Info */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                LIVE
              </span>
              <h2 className="text-xl font-bold text-gray-800">
                {currentSlot.subject?.code} - {currentSlot.subject?.name}
              </h2>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {currentSlot.class?.name} • {currentSlot.class?.department}
              </span>
              <span>Sem {currentSlot.class?.semester}</span>
              {currentSlot.batch && <span>Batch: {currentSlot.batch.name}</span>}
              <span className={`px-2 py-0.5 font-medium rounded ${
                currentSlot.type === 'theory' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {currentSlot.type.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p>Time: {formatTo12Hour(currentSlot.startTime?.slice(0, 5))} - {formatTo12Hour(currentSlot.endTime?.slice(0, 5))}</p>
          </div>
        </div>
      </Card>

      {submitted ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl font-semibold text-green-600">Attendance Submitted Successfully!</p>
            <p className="text-gray-500 mt-2">Present: {presentCount} | Absent: {absentCount} | Not Marked: {notMarkedCount}</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <Button onClick={() => markAll('present')} disabled={slotDetails?.isLocked} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50">
                Mark All Present
              </Button>
              <Button onClick={() => markAll('absent')} disabled={slotDetails?.isLocked} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm disabled:opacity-50">
                Mark All Absent
              </Button>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-semibold">Present: {presentCount}</span>
              <span className="text-red-600 font-semibold">Absent: {absentCount}</span>
              <span className="text-gray-600 font-semibold">Not Marked: {notMarkedCount}</span>
              <span className="text-gray-600 font-semibold">Total: {students.length}</span>
            </div>
            {slotDetails?.isLocked && (
              <p className="text-sm text-red-600">Attendance already submitted for this slot/date and is locked.</p>
            )}
          </div>

          {/* Student List */}
          <Card>
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
                <p className="ml-3 text-gray-600">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No students assigned to this class</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Enrollment No</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Student Name</th>
                      {currentSlot.type === 'lab' && (
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Batch</th>
                      )}
                      <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.studentId || student.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{student.enrollmentNo}</td>
                        <td className="py-3 px-4">{student.name}</td>
                        {currentSlot.type === 'lab' && (
                          <td className="py-3 px-4">{student.batch?.name || '-'}</td>
                        )}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => cycleStatus(student.studentId || student.id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              attendance[student.studentId] === 'present'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : attendance[student.studentId] === 'absent'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            disabled={slotDetails?.isLocked}
                          >
                            {attendance[student.studentId] === 'present'
                              ? 'Present'
                              : attendance[student.studentId] === 'absent'
                              ? 'Absent'
                              : 'Not Marked'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Submit */}
          {students.length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Attendance'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StartAttendance;
