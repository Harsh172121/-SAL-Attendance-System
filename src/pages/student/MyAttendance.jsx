/**
 * SAL Education - College Attendance Management System
 * My Attendance Page (Student)
 * 
 * Detailed attendance view for students.
 * Features:
 * - Subject-wise attendance breakdown
 * - Theory/Lab separation
 * - Date-wise attendance records
 * - Attendance percentage with visual indicators
 * 
 * VIVA NOTE: This page provides read-only access to the student's
 * own attendance data with filtering capabilities.
 */

import { useState, useEffect } from 'react';
import { Card, Select } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/dataService';

const MyAttendance = () => {
  const { user } = useAuth();
  // Filter state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // Data state
  const [studentInfo, setStudentInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalClasses: 0,
    present: 0,
    leave: 0,
    absent: 0,
    percentage: 0
  });

  /**
   * Load student data on mount
   */
  useEffect(() => {
    loadStudentData();
  }, []);

  /**
   * Filter records when subject/type changes
   */
  useEffect(() => {
    if (studentInfo) {
      filterRecords();
    }
  }, [selectedSubject, selectedType, studentInfo]);

  const loadStudentData = async () => {
    try {
      // Use student attendance API - returns student info, subjects, and attendance data
      const data = await attendanceService.getMyAttendance();
      if (!data) return;
      
      setStudentInfo({
        name: data.student?.name,
        enrollmentNo: data.student?.enrollmentNo,
        className: data.student?.class?.name || 'N/A'
      });
      
      // Set subjects from the attendance response
      if (data.subjects) {
        setSubjects(data.subjects.map(s => ({
          id: s.subjectId,
          name: s.subjectName,
          code: s.subjectCode,
          type: s.subjectType
        })));
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const filterRecords = async () => {
    try {
      let records = [];
      
      if (selectedSubject) {
        // Get subject-specific attendance
        const data = await attendanceService.getSubjectAttendance(selectedSubject);
        if (data?.attendance) {
          // Combine theory and lab records
          const theoryRecords = (data.attendance.theory?.records || []).map(r => ({
            ...r,
            type: 'theory',
            subjectId: parseInt(selectedSubject),
            subjectName: data.subject?.name,
            subjectCode: data.subject?.code
          }));
          const labRecords = (data.attendance.lab?.records || []).map(r => ({
            ...r,
            type: 'lab',
            subjectId: parseInt(selectedSubject),
            subjectName: data.subject?.name,
            subjectCode: data.subject?.code
          }));
          records = [...theoryRecords, ...labRecords];
        }
      } else {
        // Get overall attendance summary and build records from all subjects
        const data = await attendanceService.getMyAttendance();
        if (data?.subjects) {
          // For the records view, get detailed records for each subject
          for (const subject of data.subjects) {
            const subjectData = await attendanceService.getSubjectAttendance(subject.subjectId);
            if (subjectData?.attendance) {
              const theoryRecords = (subjectData.attendance.theory?.records || []).map(r => ({
                ...r,
                type: 'theory',
                subjectId: subject.subjectId,
                subjectName: subject.subjectName,
                subjectCode: subject.subjectCode
              }));
              const labRecords = (subjectData.attendance.lab?.records || []).map(r => ({
                ...r,
                type: 'lab',
                subjectId: subject.subjectId,
                subjectName: subject.subjectName,
                subjectCode: subject.subjectCode
              }));
              records = [...records, ...theoryRecords, ...labRecords];
            }
          }
        }
      }
      
      // Apply type filter
      if (selectedType) {
        records = records.filter(r => r.type === selectedType);
      }
      
      // Sort by date (newest first)
      records.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      
      setAttendanceRecords(records);
      
      // Calculate overall stats
      const totalClasses = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const leave = records.filter(r => r.status === 'leave').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const consideredTotal = present + absent;
      
      setOverallStats({
        totalClasses,
        present,
        leave,
        absent,
        percentage: consideredTotal > 0 ? Math.round((present / consideredTotal) * 100) : 0
      });
    } catch (error) {
      console.error('Error filtering records:', error);
    }
  };

  /**
   * Get available types for current subject
   */
  const getTypeOptions = () => {
    const options = [{ value: '', label: 'All Types' }];
    
    if (selectedSubject) {
      const subject = subjects.find(s => s.id === parseInt(selectedSubject));
      if (subject) {
        if (subject.type === 'theory' || subject.type === 'theory+lab') {
          options.push({ value: 'theory', label: 'Theory' });
        }
        if (subject.type === 'lab' || subject.type === 'theory+lab') {
          options.push({ value: 'lab', label: 'Lab' });
        }
      }
    } else {
      options.push({ value: 'theory', label: 'Theory' });
      options.push({ value: 'lab', label: 'Lab' });
    }
    
    return options;
  };

  /**
   * Get percentage color
   */
  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentageBg = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Subject options
  const subjectOptions = [
    { value: '', label: 'All Subjects' },
    ...subjects.map(s => ({
      value: s.id.toString(),
      label: `${s.code} - ${s.name}`
    }))
  ];

  /**
   * Group records by subject for summary view
   */
  const getSubjectSummary = () => {
    const summary = {};
    
    attendanceRecords.forEach(record => {
      if (!summary[record.subjectId]) {
        summary[record.subjectId] = {
          subjectId: record.subjectId,
          subjectName: record.subjectName,
          subjectCode: record.subjectCode,
          theoryPresent: 0,
          theoryTotal: 0,
          theoryLeave: 0,
          theoryAbsent: 0,
          labPresent: 0,
          labTotal: 0,
          labLeave: 0,
          labAbsent: 0
        };
      }
      
      if (record.type === 'theory') {
        summary[record.subjectId].theoryTotal++;
        if (record.status === 'present') {
          summary[record.subjectId].theoryPresent++;
        } else if (record.status === 'leave') {
          summary[record.subjectId].theoryLeave++;
        } else {
          summary[record.subjectId].theoryAbsent++;
        }
      } else if (record.type === 'lab') {
        summary[record.subjectId].labTotal++;
        if (record.status === 'present') {
          summary[record.subjectId].labPresent++;
        } else if (record.status === 'leave') {
          summary[record.subjectId].labLeave++;
        } else {
          summary[record.subjectId].labAbsent++;
        }
      }
    });

    return Object.values(summary).map(s => ({
      ...s,
      theoryPercentage: (s.theoryPresent + s.theoryAbsent) > 0
        ? Math.round((s.theoryPresent / (s.theoryPresent + s.theoryAbsent)) * 100)
        : 0,
      labPercentage: (s.labPresent + s.labAbsent) > 0
        ? Math.round((s.labPresent / (s.labPresent + s.labAbsent)) * 100)
        : 0,
      total: s.theoryTotal + s.labTotal,
      totalPresent: s.theoryPresent + s.labPresent,
      totalLeave: s.theoryLeave + s.labLeave,
      totalAbsent: s.theoryAbsent + s.labAbsent,
      overallPercentage: (s.theoryPresent + s.labPresent + s.theoryAbsent + s.labAbsent) > 0
        ? Math.round(((s.theoryPresent + s.labPresent) / (s.theoryPresent + s.labPresent + s.theoryAbsent + s.labAbsent)) * 100)
        : 0
    }));
  };

  /**
   * Group records by date
   */
  const getRecordsByDate = () => {
    const dateGroups = {};
    
    attendanceRecords.forEach(record => {
      if (!dateGroups[record.date]) {
        dateGroups[record.date] = [];
      }
      dateGroups[record.date].push(record);
    });
    
    return Object.entries(dateGroups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
        <p className="text-gray-600">
          {studentInfo?.name} | {studentInfo?.className} | {studentInfo?.enrollmentNo}
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">{overallStats.totalClasses}</p>
          <p className="text-sm text-gray-500">Total Classes</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{overallStats.present}</p>
          <p className="text-sm text-gray-500">Present</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{overallStats.leave}</p>
          <p className="text-sm text-gray-500">Leave</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{overallStats.absent}</p>
          <p className="text-sm text-gray-500">Absent</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className={`text-3xl font-bold ${getPercentageColor(overallStats.percentage)}`}>
            {overallStats.percentage}%
          </p>
          <p className="text-sm text-gray-500">Attendance</p>
        </div>
      </div>

      {/* Filters */}
      <Card title="Filter Records">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Subject"
            id="subject"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedType('');
            }}
            options={subjectOptions}
          />
          
          <Select
            label="Type"
            id="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={getTypeOptions()}
          />
        </div>
      </Card>

      {/* Subject Summary */}
      {!selectedSubject && (
        <Card title="Subject-wise Summary">
          {getSubjectSummary().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Theory</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lab</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Overall</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSubjectSummary().map(subject => (
                    <tr key={subject.subjectId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-gray-800">{subject.subjectName}</p>
                        <p className="text-sm text-gray-500">{subject.subjectCode}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {subject.theoryTotal > 0 ? (
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              subject.theoryPercentage >= 75 ? 'bg-green-100 text-green-800' :
                              subject.theoryPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {subject.theoryPercentage}%
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              P: {subject.theoryPresent} | L: {subject.theoryLeave} | A: {subject.theoryAbsent}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {subject.labTotal > 0 ? (
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              subject.labPercentage >= 75 ? 'bg-green-100 text-green-800' :
                              subject.labPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {subject.labPercentage}%
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              P: {subject.labPresent} | L: {subject.labLeave} | A: {subject.labAbsent}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getPercentageBg(subject.overallPercentage)}`}
                              style={{ width: `${subject.overallPercentage}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold ${getPercentageColor(subject.overallPercentage)}`}>
                            {subject.overallPercentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No attendance records found.</p>
            </div>
          )}
        </Card>
      )}

      {/* Date-wise Records */}
      <Card title="Attendance Records">
        {getRecordsByDate().length > 0 ? (
          <div className="space-y-4">
            {getRecordsByDate().map(([date, records]) => (
              <div key={date} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {records.map(record => (
                    <div
                      key={record.id}
                      className={`flex items-center justify-between p-3 rounded ${
                        record.status === 'present'
                          ? 'bg-green-50 border border-green-200'
                          : record.status === 'leave'
                            ? 'bg-yellow-50 border border-yellow-200'
                            : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          {record.subjectCode}
                        </p>
                        <p className="text-xs text-gray-500">
                          {record.type === 'theory' ? 'Theory' : 'Lab'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        record.status === 'present'
                          ? 'bg-green-200 text-green-800'
                          : record.status === 'leave'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-red-200 text-red-800'
                      }`}>
                        {record.status === 'present' ? 'Present' : record.status === 'leave' ? 'Leave' : 'Absent'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">No attendance records found</p>
            <p className="text-sm">Your attendance will appear here once marked.</p>
          </div>
        )}
      </Card>

      {/* Attendance Notice */}
      {overallStats.percentage < 75 && overallStats.totalClasses > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r">
          <div className="flex">
            <svg className="w-6 h-6 text-yellow-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-800">Important Notice</h4>
              <p className="text-sm text-yellow-700">
                Minimum 75% attendance is required to appear in examinations. 
                Your current attendance is {overallStats.percentage}%.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAttendance;
