/**
 * SAL Education - College Attendance Management System
 * View Attendance Page (Teacher)
 * 
 * Teachers can view attendance records for their assigned subjects.
 * Features:
 * - Filter by subject, date, type
 * - View attendance by date
 * - See student-wise statistics
 * 
 * VIVA NOTE: This page provides read-only access to attendance data
 * for subjects assigned to the logged-in teacher.
 */

import { useState, useEffect } from 'react';
import { Card, Select, Input, Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/dataService';

const ViewAttendance = () => {
  const { user } = useAuth();
  // Filter state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Data state
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [viewMode, setViewMode] = useState('date'); // 'date' or 'summary'

  /**
   * Load teacher's assigned subjects
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
   * Current subject details
   */
  const currentSubject = assignedSubjects.find(s => s.id === parseInt(selectedSubject));

  /**
   * Type options based on subject
   */
  const getTypeOptions = () => {
    if (!currentSubject) return [];
    
    const options = [{ value: '', label: 'All Types' }];
    if (currentSubject.teachingType === 'theory' || currentSubject.teachingType === 'both') {
      options.push({ value: 'theory', label: 'Theory' });
    }
    if (currentSubject.teachingType === 'lab' || currentSubject.teachingType === 'both') {
      options.push({ value: 'lab', label: 'Lab' });
    }
    return options;
  };

  /**
   * Search attendance records
   */
  const searchAttendance = async () => {
    if (!selectedSubject) {
      return;
    }

    try {
      // Build query params
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (selectedType) params.type = selectedType;
      
      const data = await attendanceService.getBySubjectId(selectedSubject, params);
      const records = data.attendance || [];

      // Backend already includes student and batch info
      const enrichedRecords = records.map(record => ({
        ...record,
        studentName: record.student?.name || 'Unknown',
        enrollmentNo: record.student?.enrollmentNo || 'N/A',
        batchName: record.batch?.name || 'N/A'
      }));

      // Sort by date (newest first), then by student name
      enrichedRecords.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return a.studentName.localeCompare(b.studentName);
      });

      setAttendanceData(enrichedRecords);
    } catch (error) {
      console.error('Error searching attendance:', error);
      setAttendanceData([]);
    }
  };

  /**
   * Get unique dates from attendance data
   */
  const getUniqueDates = () => {
    const dates = [...new Set(attendanceData.map(a => a.date))];
    return dates.sort((a, b) => b.localeCompare(a));
  };

  /**
   * Get attendance for a specific date
   */
  const getAttendanceByDate = (date) => {
    return attendanceData.filter(a => a.date === date);
  };

  /**
   * Get attendance summary by student
   */
  const getStudentSummary = () => {
    const summary = {};
    
    attendanceData.forEach(record => {
      if (!summary[record.studentId]) {
        summary[record.studentId] = {
          studentId: record.studentId,
          studentName: record.studentName,
          enrollmentNo: record.enrollmentNo,
          theoryPresent: 0,
          theoryTotal: 0,
          labPresent: 0,
          labTotal: 0
        };
      }
      
      if (record.type === 'theory') {
        summary[record.studentId].theoryTotal++;
        if (record.status === 'present') {
          summary[record.studentId].theoryPresent++;
        }
      } else if (record.type === 'lab') {
        summary[record.studentId].labTotal++;
        if (record.status === 'present') {
          summary[record.studentId].labPresent++;
        }
      }
    });

    return Object.values(summary).map(s => ({
      ...s,
      theoryPercentage: s.theoryTotal > 0 
        ? Math.round((s.theoryPresent / s.theoryTotal) * 100) 
        : 0,
      labPercentage: s.labTotal > 0 
        ? Math.round((s.labPresent / s.labTotal) * 100) 
        : 0
    }));
  };

  // Subject options - include class name to distinguish between classes
  const subjectOptions = assignedSubjects.map(s => ({
    value: s.id.toString(),
    label: `${s.code} - ${s.name}${s.class ? ` (${s.class.name})` : ''}`
  }));

  /**
   * Get percentage color
   */
  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">View Attendance</h1>
        <p className="text-gray-600">View attendance records for your classes</p>
      </div>

      {/* Filters */}
      <Card title="Search Filters">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Subject"
            id="subject"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedType('');
              setAttendanceData([]);
            }}
            options={subjectOptions}
            placeholder="Select subject"
            required
          />
          
          <Select
            label="Type"
            id="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={getTypeOptions()}
            placeholder="All Types"
            disabled={!selectedSubject}
          />
          
          <Input
            label="Date"
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          
          <div className="flex items-end">
            <Button onClick={searchAttendance} className="w-full">
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Class Info Banner */}
      {currentSubject && currentSubject.class && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-blue-800 font-medium">
            Class: {currentSubject.class.name}
          </span>
          {currentSubject.class.department && (
            <span className="text-blue-600 text-sm">
              • {currentSubject.class.department} — Sem {currentSubject.class.semester}
            </span>
          )}
        </div>
      )}

      {/* View Mode Toggle */}
      {attendanceData.length > 0 && (
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('date')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            View by Date
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'summary'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Student Summary
          </button>
        </div>
      )}

      {/* Results */}
      {attendanceData.length > 0 && viewMode === 'date' && (
        <div className="space-y-4">
          {getUniqueDates().map(date => {
            const dateRecords = getAttendanceByDate(date);
            const presentCount = dateRecords.filter(r => r.status === 'present').length;
            const leaveCount = dateRecords.filter(r => r.status === 'leave').length;
            
            return (
              <Card key={date}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {dateRecords[0]?.type === 'theory' ? 'Theory' : 'Lab'}
                      {dateRecords[0]?.type === 'lab' && ` - ${dateRecords[0]?.batchName}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">
                      {presentCount}/{dateRecords.length}
                    </p>
                    <p className={`text-sm font-medium ${
                      Math.round((presentCount / dateRecords.length) * 100) >= 75
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {Math.round((presentCount / dateRecords.length) * 100)}% Present
                      {leaveCount > 0 && ` • ${leaveCount} Leave`}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {dateRecords.map(record => (
                    <div
                      key={record.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        record.status === 'present'
                          ? 'bg-green-50 text-green-800'
                          : record.status === 'leave'
                          ? 'bg-yellow-50 text-yellow-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{record.studentName}</p>
                        <p className="text-xs opacity-75">{record.enrollmentNo}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        record.status === 'present'
                          ? 'bg-green-200'
                          : record.status === 'leave'
                          ? 'bg-yellow-200'
                          : 'bg-red-200'
                      }`}>
                        {record.status === 'present' ? 'P' : record.status === 'leave' ? 'L' : 'A'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Student Summary View */}
      {attendanceData.length > 0 && viewMode === 'summary' && (
        <Card title="Student-wise Summary">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Theory</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lab</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getStudentSummary().map(student => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800">{student.studentName}</p>
                      <p className="text-sm text-gray-500">{student.enrollmentNo}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {student.theoryTotal > 0 ? (
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentageColor(student.theoryPercentage)}`}>
                            {student.theoryPercentage}%
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {student.theoryPresent}/{student.theoryTotal}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {student.labTotal > 0 ? (
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentageColor(student.labPercentage)}`}>
                            {student.labPercentage}%
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {student.labPresent}/{student.labTotal}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* No data state */}
      {selectedSubject && attendanceData.length === 0 && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">No attendance records found</p>
            <p className="text-sm">Try adjusting your search filters or mark attendance first.</p>
          </div>
        </Card>
      )}

      {/* Initial state */}
      {!selectedSubject && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-medium">Select a subject to view attendance</p>
            <p className="text-sm">Choose a subject from the dropdown and click Search.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ViewAttendance;
