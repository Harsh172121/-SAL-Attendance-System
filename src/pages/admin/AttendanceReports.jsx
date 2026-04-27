/**
 * SAL Education - College Attendance Management System
 * Attendance Reports Page
 * 
 * Comprehensive attendance reports with multiple views:
 * - Class-wise report
 * - Student-wise report
 * - Subject-wise report
 * 
 * VIVA NOTE: This page aggregates attendance data using the
 * attendanceService report functions. Theory and Lab are shown separately.
 */

import { useState, useEffect } from 'react';
import { Card, Select, Button } from '../../components';
import { classService, subjectService, studentService } from '../../services/dataService';
import api from '../../services/api';

const AttendanceReports = () => {
  // State for report type selection
  const [reportType, setReportType] = useState('class');
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  
  // Data states
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [selectedSubjectInfo, setSelectedSubjectInfo] = useState(null);

  /**
   * Load initial dropdown data
   */
  useEffect(() => {
    const loadData = async () => {
      const [classesData, subjectsData, studentsData] = await Promise.all([
        classService.getAll(),
        subjectService.getAll(),
        studentService.getAll()
      ]);
      setClasses(classesData);
      setSubjects(subjectsData);
      setStudents(studentsData);
    };
    loadData();
  }, []);

  /**
   * Generate report based on selected type and filters
   */
  const generateReport = async () => {
    try {
      switch (reportType) {
        case 'class':
          if (selectedClass) {
            const res = await api.get(`/admin/reports/class/${selectedClass}`);
            setReportData(res.data.success ? res.data.data : []);
          }
          break;
        case 'subject':
          if (selectedSubject) {
            const subjectInfo = subjects.find(s => s.id === parseInt(selectedSubject));
            setSelectedSubjectInfo(subjectInfo);
            const res = await api.get(`/admin/reports/subject/${selectedSubject}`);
            setReportData(res.data.success ? res.data.data : []);
          }
          break;
        case 'student':
          if (selectedStudent) {
            const res = await api.get(`/admin/reports/student/${selectedStudent}`);
            setReportData(res.data.success ? res.data.data : []);
          }
          break;
        default:
          setReportData([]);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setReportData([]);
    }
  };

  /**
   * Reset filters when report type changes
   */
  useEffect(() => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedStudent('');
    setReportData([]);
    setSelectedSubjectInfo(null);
  }, [reportType]);

  // Dropdown options
  const classOptions = classes.map(c => ({
    value: c.id.toString(),
    label: `${c.name} - ${c.department}`
  }));

  const subjectOptions = subjects.map(s => ({
    value: s.id.toString(),
    label: `${s.code} - ${s.name}${s.class ? ` (${s.class.name})` : ''}`
  }));

  const studentOptions = students.map(s => ({
    value: s.id.toString(),
    label: `${s.enrollmentNo} - ${s.name}`
  }));

  /**
   * Get attendance percentage color class
   */
  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  /**
   * Render progress bar
   */
  const ProgressBar = ({ percentage }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full ${
          percentage >= 75 ? 'bg-green-500' :
          percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Attendance Reports</h1>
        <p className="text-gray-600">View and analyze attendance data</p>
      </div>

      {/* Report type selection */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="class">Class-wise Report</option>
              <option value="subject">Subject-wise Report</option>
              <option value="student">Student-wise Report</option>
            </select>
          </div>

          {/* Dynamic filter based on report type */}
          {reportType === 'class' && (
            <Select
              label="Select Class"
              id="class"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setReportData([]);
              }}
              options={classOptions}
              placeholder="Choose a class"
            />
          )}

          {reportType === 'subject' && (
            <Select
              label="Select Subject"
              id="subject"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setReportData([]);
                setSelectedSubjectInfo(null);
              }}
              options={subjectOptions}
              placeholder="Choose a subject"
            />
          )}

          {reportType === 'student' && (
            <Select
              label="Select Student"
              id="student"
              value={selectedStudent}
              onChange={(e) => {
                setSelectedStudent(e.target.value);
                setReportData([]);
              }}
              options={studentOptions}
              placeholder="Choose a student"
            />
          )}

          {/* Generate button */}
          <div className="flex items-end">
            <Button onClick={generateReport} className="w-full md:w-auto">
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Results */}
      {reportData.length > 0 && (
        <Card title={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}>
          {/* Class-wise Report Table */}
          {reportType === 'class' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((row) => (
                    <tr key={row.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.enrollmentNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.present}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-700">{row.leave}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{row.absent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getPercentageColor(row.percentage)}`}>
                          {row.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-32">
                        <ProgressBar percentage={row.percentage} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Subject-wise Report Table */}
          {reportType === 'subject' && selectedSubjectInfo && (
            <div className="overflow-x-auto">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{selectedSubjectInfo.code} - {selectedSubjectInfo.name}</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  selectedSubjectInfo.type === 'theory' ? 'bg-blue-100 text-blue-800' :
                  selectedSubjectInfo.type === 'lab' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {selectedSubjectInfo.type === 'theory+lab' ? 'Theory + Lab' : 
                   selectedSubjectInfo.type.charAt(0).toUpperCase() + selectedSubjectInfo.type.slice(1)}
                </span>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                    {(selectedSubjectInfo.type === 'theory' || selectedSubjectInfo.type === 'theory+lab') && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase" colSpan="4">Theory</th>
                    )}
                    {(selectedSubjectInfo.type === 'lab' || selectedSubjectInfo.type === 'theory+lab') && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase" colSpan="4">Lab</th>
                    )}
                  </tr>
                  <tr className="bg-gray-25">
                    <th></th>
                    <th></th>
                    {(selectedSubjectInfo.type === 'theory' || selectedSubjectInfo.type === 'theory+lab') && (
                      <>
                        <th className="px-3 py-2 text-xs text-gray-400">Present</th>
                        <th className="px-3 py-2 text-xs text-gray-400">Leave</th>
                        <th className="px-3 py-2 text-xs text-gray-400">Absent</th>
                        <th className="px-3 py-2 text-xs text-gray-400">%</th>
                      </>
                    )}
                    {(selectedSubjectInfo.type === 'lab' || selectedSubjectInfo.type === 'theory+lab') && (
                      <>
                        <th className="px-3 py-2 text-xs text-gray-400">Present</th>
                        <th className="px-3 py-2 text-xs text-gray-400">Leave</th>
                        <th className="px-3 py-2 text-xs text-gray-400">Absent</th>
                        <th className="px-3 py-2 text-xs text-gray-400">%</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((row) => (
                    <tr key={row.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.enrollmentNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.studentName}</td>
                      {(selectedSubjectInfo.type === 'theory' || selectedSubjectInfo.type === 'theory+lab') && (
                        <>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {row.theory.present}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-yellow-700">
                            {row.theory.leave}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-red-600">
                            {row.theory.absent}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentageColor(row.theory.percentage)}`}>
                              {row.theory.percentage}%
                            </span>
                          </td>
                        </>
                      )}
                      {(selectedSubjectInfo.type === 'lab' || selectedSubjectInfo.type === 'theory+lab') && (
                        <>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {row.lab.present}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-yellow-700">
                            {row.lab.leave}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-red-600">
                            {row.lab.absent}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPercentageColor(row.lab.percentage)}`}>
                              {row.lab.percentage}%
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Student-wise Report Cards */}
          {reportType === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportData.map((subject) => (
                <div key={subject.subjectId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{subject.subjectName}</h4>
                      <p className="text-sm text-gray-500">{subject.subjectCode}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subject.subjectType === 'theory' ? 'bg-blue-100 text-blue-800' :
                      subject.subjectType === 'lab' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {subject.subjectType === 'theory+lab' ? 'Theory + Lab' : 
                       subject.subjectType.charAt(0).toUpperCase() + subject.subjectType.slice(1)}
                    </span>
                  </div>

                  {/* Theory attendance */}
                  {(subject.subjectType === 'theory' || subject.subjectType === 'theory+lab') && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Theory</span>
                        <span className={`font-medium ${getPercentageColor(subject.theory.percentage).split(' ')[0]}`}>
                          {subject.theory.percentage}%
                        </span>
                      </div>
                      <ProgressBar percentage={subject.theory.percentage} />
                      <p className="mt-2 text-xs text-gray-500">
                        P: {subject.theory.present} | L: {subject.theory.leave} | A: {subject.theory.absent} | Total: {subject.theory.total}
                      </p>
                    </div>
                  )}

                  {/* Lab attendance */}
                  {(subject.subjectType === 'lab' || subject.subjectType === 'theory+lab') && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Lab</span>
                        <span className={`font-medium ${getPercentageColor(subject.lab.percentage).split(' ')[0]}`}>
                          {subject.lab.percentage}%
                        </span>
                      </div>
                      <ProgressBar percentage={subject.lab.percentage} />
                      <p className="mt-2 text-xs text-gray-500">
                        P: {subject.lab.present} | L: {subject.lab.leave} | A: {subject.lab.absent} | Total: {subject.lab.total}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Empty state when no data */}
      {reportData.length === 0 && (selectedClass || selectedSubject || selectedStudent) && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">No attendance data found</p>
            <p className="text-sm">Try selecting different filters or ensure attendance has been marked.</p>
          </div>
        </Card>
      )}

      {/* Instructions when nothing selected */}
      {!selectedClass && !selectedSubject && !selectedStudent && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">Select filters to generate report</p>
            <p className="text-sm">Choose a report type and make a selection, then click "Generate Report"</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceReports;
