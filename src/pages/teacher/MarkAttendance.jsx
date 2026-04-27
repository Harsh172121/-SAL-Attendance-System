/**
 * SAL Education - College Attendance Management System
 * Mark Attendance Page
 * 
 * Teacher can mark attendance for their assigned classes.
 * Features:
 * - Select subject (shows only assigned subjects)
 * - Select type (Theory/Lab)
 * - If Lab, select batch
 * - Select date
 * - Dynamic student list
 * - Mark present/absent with toggle
 * 
 * VIVA NOTE: This page demonstrates conditional UI rendering.
 * Lab attendance requires batch selection, theory does not.
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, Select, Input } from '../../components';
import { attendanceService } from '../../services/dataService';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySubjectId = searchParams.get('subjectId');
  const queryClassId = searchParams.get('classId');
  const querySlotId = searchParams.get('slotId');
  const queryBatchId = searchParams.get('batchId');
  const queryType = searchParams.get('type');
  const queryDate = searchParams.get('date');
  const querySubjectName = searchParams.get('subjectName');
  const querySubjectCode = searchParams.get('subjectCode');
  const isSlotMode = Boolean(querySubjectId && queryClassId && querySlotId);
  
  // Selection state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [topicCovered, setTopicCovered] = useState('');
  
  // Data state
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showStudentList, setShowStudentList] = useState(false);
  const [slotContext, setSlotContext] = useState(null);
  const [slotDetails, setSlotDetails] = useState(null);

  /**
   * Load teacher's assigned subjects on mount
   */
  useEffect(() => {
    const loadSubjects = async () => {
      // Get teacher's assigned subjects via teacher API
      const subjects = await attendanceService.getMySubjects();
      setAssignedSubjects(subjects);
    };
    loadSubjects();
  }, []);

  /**
   * Get current subject details
   */
  const currentSubject = assignedSubjects.find(s => s.id === parseInt(selectedSubject));

  /**
   * Get available types for selected subject
   */
  const getTypeOptions = () => {
    if (!currentSubject) return [];
    
    const options = [];
    if (currentSubject.teachingType === 'theory' || currentSubject.teachingType === 'both') {
      options.push({ value: 'theory', label: 'Theory' });
    }
    if (currentSubject.teachingType === 'lab' || currentSubject.teachingType === 'both') {
      options.push({ value: 'lab', label: 'Lab' });
    }
    return options;
  };

  /**
   * Load batches when subject changes and type is lab
   */
  useEffect(() => {
    const loadBatches = async () => {
      if (currentSubject && selectedType === 'lab') {
        const classBatches = await attendanceService.getBatchesForSubject(currentSubject.id);
        setBatches(classBatches);
      } else {
        setBatches([]);
        setSelectedBatch('');
      }
    };
    loadBatches();
  }, [currentSubject, selectedType]);

  useEffect(() => {
    if (!isSlotMode) {
      setSlotContext(null);
      setSlotDetails(null);
      return;
    }

    const inferredType = queryType || (queryBatchId ? 'lab' : 'theory');
    const resolvedDate = queryDate || new Date().toISOString().split('T')[0];

    setSelectedSubject(querySubjectId);
    setSelectedType(inferredType);
    setSelectedBatch(queryBatchId || '');
    setSelectedDate(resolvedDate);
    setSlotContext({
      slotId: Number(querySlotId),
      subjectId: Number(querySubjectId),
      classId: Number(queryClassId),
      batchId: queryBatchId ? Number(queryBatchId) : null,
      type: inferredType,
      subjectName: querySubjectName || '',
      subjectCode: querySubjectCode || '',
      date: resolvedDate
    });
  }, [
    isSlotMode,
    queryBatchId,
    queryClassId,
    queryDate,
    querySlotId,
    querySubjectCode,
    querySubjectId,
    querySubjectName,
    queryType
  ]);

  /**
   * Load students based on selection
   */
  const loadStudents = async () => {
    if (!isSlotMode && (!currentSubject || !selectedType || !selectedDate)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const activeType = isSlotMode ? slotContext?.type : selectedType;
    const activeBatch = isSlotMode ? (slotContext?.batchId ? String(slotContext.batchId) : '') : selectedBatch;

    if (activeType === 'lab' && !activeBatch) {
      toast.error('Please select a batch for lab attendance');
      return;
    }

    if (
      slotContext &&
      activeType === 'lab' &&
      slotContext.batchId &&
      Number(activeBatch) !== Number(slotContext.batchId)
    ) {
      toast.error('Selected batch does not match the selected timetable slot.');
      return;
    }

    setIsLoading(true);
    setIsSubmitted(false);

    try {
      let studentList = [];

      if (slotContext) {
        const context = await attendanceService.getSlotAttendanceContext(slotContext.slotId, selectedDate);
        setSlotDetails(context.slotDetails);
        studentList = context.students || [];
      } else {
        const params = { type: activeType };
        if (activeType === 'lab') {
          params.batchId = selectedBatch;
        }
        const data = await attendanceService.getStudentsForAttendance(currentSubject.id, params);
        studentList = data.students || [];
      }

      // Initialize attendance state
      const attendanceState = {};
      studentList.forEach(student => {
        const id = student.id || student.studentId;
        const fromServer = student.attendanceStatus;
        attendanceState[id] = slotContext
          ? (['present', 'absent'].includes(fromServer) ? fromServer : 'not_marked')
          : 'present';
      });

      setStudents(studentList);
      setAttendance(attendanceState);
      setShowStudentList(true);
    } catch (studentLoadError) {
      console.error('Error loading students:', studentLoadError);
      toast.error('Failed to load students');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!slotContext) {
      return;
    }

    loadStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotContext]);

  /**
   * Toggle individual student attendance
   */
  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  /**
   * Mark all students as present/absent
   */
  const markAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      const studentId = student.studentId || student.id;
      newAttendance[studentId] = status;
    });
    setAttendance(newAttendance);
  };

  /**
   * Submit attendance
   */
  const handleSubmit = async () => {
    if (students.length === 0) {
      toast.error('No students to mark attendance for');
      return;
    }

    if (isSubmitted) {
      return;
    }

    setIsSubmitting(true);

    // Prepare attendance data for backend
    const payload = {
      subjectId: currentSubject?.id,
      date: selectedDate,
      type: selectedType,
      batchId: selectedType === 'lab' ? parseInt(selectedBatch) : null,
      topicCovered,
      attendanceData: students.map(student => ({
        studentId: student.id,
        status: attendance[student.id]
      }))
    };

    try {
      if (slotContext) {
        await attendanceService.saveSlotAttendance(Number(slotContext.slotId), {
          date: selectedDate,
          topicCovered,
          attendance: students.map((student) => ({
            studentId: student.studentId || student.id,
            status: attendance[student.studentId || student.id] === 'absent' ? 'absent' : 'present'
          }))
        });
      } else if (currentSubject) {
        await attendanceService.markAttendance(payload);
      }

      const presentCount = Object.values(attendance).filter(s => s === 'present').length;
      toast.success(
        `Attendance saved! Present: ${presentCount}, Absent: ${students.length - presentCount}`
      );
      setIsSubmitted(true);
      if (slotContext) {
        setSlotDetails((prev) => (prev ? { ...prev, isLocked: true } : prev));
      }
    } catch {
      toast.error('Failed to save attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Subject options - include class name to distinguish between classes
  const subjectOptions = assignedSubjects.map(s => ({
    value: s.id.toString(),
    label: `${s.code} - ${s.name}${s.class ? ` (${s.class.name})` : ''}`
  }));

  // Batch options
  const batchOptions = batches.map(b => ({
    value: b.id.toString(),
    label: b.name
  }));

  // Calculate attendance stats
  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = students.length - presentCount;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>
          <p className="text-gray-600">{isSlotMode ? 'Slot-linked attendance loaded automatically' : 'Select subject, date and mark student attendance'}</p>
      </div>

      {/* Auto-detect suggestion banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-blue-800 font-medium">Have lecture slots configured?</p>
          <p className="text-blue-600 text-sm">Use auto-detect to skip manual selection — system will find your current lecture automatically.</p>
        </div>
        <Button
          onClick={() => navigate('/teacher/start-attendance')}
          className="px-5 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 text-sm whitespace-nowrap"
        >
          Start Attendance (Auto-Detect)
        </Button>
      </div>

      {/* Selection Form */}
      {!isSlotMode && (
      <Card title="Select Class & Date">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Subject"
            id="subject"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedType('');
              setShowStudentList(false);
            }}
            options={subjectOptions}
            placeholder="Select subject"
            disabled={isSlotMode}
            required
          />
          
          <Select
            label="Type"
            id="type"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setShowStudentList(false);
            }}
            options={getTypeOptions()}
            placeholder="Select type"
            disabled={!selectedSubject || isSlotMode}
            required
          />
          
          {selectedType === 'lab' && (
            <Select
              label="Batch"
              id="batch"
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setShowStudentList(false);
              }}
                options={batchOptions}
                placeholder="Select batch"
                disabled={isSlotMode}
                required
              />
            )}
          
          <Input
            label="Date"
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setShowStudentList(false);
            }}
            max={new Date().toISOString().split('T')[0]}
            disabled={isSlotMode}
            required
          />
        </div>

        <div className="mt-4">
          <Button onClick={loadStudents} disabled={isLoading || !selectedSubject}>
            {isLoading ? 'Loading...' : 'Load Students'}
          </Button>
        </div>
      </Card>
      )}

      {isSlotMode && (
        <Card title="Slot Context">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p><span className="font-medium">Subject:</span> {slotContext?.subjectCode ? `${slotContext.subjectCode} - ` : ''}{slotContext?.subjectName || slotContext?.subjectId}</p>
            <p><span className="font-medium">Class ID:</span> {slotContext?.classId}</p>
            <p><span className="font-medium">Slot ID:</span> {slotContext?.slotId}</p>
            <p><span className="font-medium">Date:</span> {selectedDate}</p>
            {slotDetails && (
              <p><span className="font-medium">Lock Status:</span> {slotDetails.isLocked ? 'Submitted (Locked)' : 'Open'}</p>
            )}
          </div>
          {!showStudentList && (
            <p className="mt-3 text-sm text-blue-700">Loading class students from selected slot...</p>
          )}
        </Card>
      )}

      {/* Student List */}
      {showStudentList && students.length > 0 && (
        <Card>
          {/* Attendance header with stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {(isSlotMode
                  ? (slotContext?.subjectName || `Subject ${slotContext?.subjectId}`)
                  : currentSubject?.name)} - {(isSlotMode ? slotContext?.type : selectedType) === 'lab' ? 'Lab' : 'Theory'}
              </h3>
              <p className="text-sm text-gray-500">
                Date: {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {(isSlotMode ? slotContext?.type : selectedType) === 'lab' && ` | ${batches.find(b => b.id === parseInt(selectedBatch))?.name || `Batch ${slotContext?.batchId}`}`}
              </p>
              {slotDetails?.isLocked && (
                <p className="text-xs text-red-600 mt-1">Attendance already submitted for this slot/date and is now locked.</p>
              )}
            </div>
            
            {/* Quick actions */}
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <Button size="sm" onClick={() => markAll('present')} disabled={slotDetails?.isLocked}>
                Mark All Present
              </Button>
              <Button size="sm" variant="outline" onClick={() => markAll('absent')} disabled={slotDetails?.isLocked}>
                Mark All Absent
              </Button>
            </div>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{students.length}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              <p className="text-sm text-gray-500">Present</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              <p className="text-sm text-gray-500">Absent</p>
            </div>
          </div>

          {/* Student list */}
          <div className="space-y-2">
            {students.map((student, index) => (
              <div
                key={student.studentId || student.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  attendance[student.studentId || student.id] === 'present'
                    ? 'bg-green-50 border-green-200'
                    : attendance[student.studentId || student.id] === 'absent'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500 w-8">{index + 1}.</span>
                  <div>
                    <p className="font-medium text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.enrollmentNo}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleAttendance(student.studentId || student.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    attendance[student.studentId || student.id] === 'present'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : attendance[student.studentId || student.id] === 'absent'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                  disabled={slotDetails?.isLocked}
                >
                  {attendance[student.studentId || student.id] === 'present'
                    ? 'Present'
                    : attendance[student.studentId || student.id] === 'absent'
                    ? 'Absent'
                    : 'Not Marked'}
                </button>
              </div>
            ))}
          </div>

          {/* Topic Covered */}
          <div className="mt-6 mb-4">
            <Input
              label="Topic Covered"
              id="topicCovered"
              placeholder="Enter the topic covered in this lecture (e.g., Introduction to React)"
              value={topicCovered}
              onChange={(e) => setTopicCovered(e.target.value)}
              disabled={slotDetails?.isLocked || isSubmitted}
              required
            />
          </div>

          {/* Submit button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit} size="lg" disabled={isSubmitting || isSubmitted || slotDetails?.isLocked}>
              {isSubmitted ? 'Attendance Submitted' : isSubmitting ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </Card>
      )}

      {/* Empty state */}
      {showStudentList && students.length === 0 && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-lg font-medium">No students assigned to this class</p>
            <p className="text-sm">There are no active students mapped to this slot class/batch.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MarkAttendance;
