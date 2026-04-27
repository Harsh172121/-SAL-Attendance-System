/**
 * SAL Education - College Attendance Management System
 * Student Dashboard Page
 * 
 * Overview for students showing their class info, attendance summary,
 * and quick access to view detailed attendance.
 * 
 * VIVA NOTE: This dashboard uses the logged-in student's ID to fetch
 * their attendance data and show personalized statistics.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, StatsCard } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/dataService';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  // Student data state
  const [studentInfo, setStudentInfo] = useState(null);
  const [stats, setStats] = useState({
    overallPercentage: 0,
    presentClasses: 0,
    leaveClasses: 0,
    totalClasses: 0
  });
  const [subjectStats, setSubjectStats] = useState([]);

  /**
   * Load student data on mount
   */
  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      // Use student dashboard API - returns all needed data
      const dashboardData = await attendanceService.getStudentDashboard();
      if (!dashboardData) return;
      
      setStudentInfo({
        name: dashboardData.student?.name,
        enrollmentNo: dashboardData.student?.enrollmentNo,
        className: dashboardData.student?.class?.name || 'N/A',
        batchName: dashboardData.student?.batch?.name || 'N/A'
      });
      
      setStats({
        overallPercentage: dashboardData.stats?.overallPercentage || 0,
        presentClasses: dashboardData.stats?.presentClasses || 0,
        leaveClasses: dashboardData.stats?.leaveClasses || 0,
        totalClasses: dashboardData.stats?.totalClasses || 0
      });

      // Also fetch detailed attendance for subject stats
      const attendanceData = await attendanceService.getMyAttendance();
      if (attendanceData?.subjects) {
        setSubjectStats(attendanceData.subjects.map(s => ({
          id: s.subjectId,
          name: s.subjectName,
          code: s.subjectCode,
          type: s.subjectType,
          theoryPresent: s.theory?.present || 0,
          theoryLeave: s.theory?.leave || 0,
          theoryAbsent: s.theory?.absent || 0,
          theoryTotal: s.theory?.total || 0,
          theoryPercentage: s.theory?.percentage || 0,
          labPresent: s.lab?.present || 0,
          labLeave: s.lab?.leave || 0,
          labAbsent: s.lab?.absent || 0,
          labTotal: s.lab?.total || 0,
          labPercentage: s.lab?.percentage || 0
        })));
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  /**
   * Get color based on percentage
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

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {studentInfo?.name || user?.name || 'Student'}!
          </h1>
          <p className="text-gray-600">
            {studentInfo?.className} | {studentInfo?.batchName}
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-sm text-gray-500">
          Enrollment No: {studentInfo?.enrollmentNo || 'N/A'}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Overall Attendance"
          value={`${stats.overallPercentage}%`}
          bgColor={getPercentageBg(stats.overallPercentage)}
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Present Classes"
          value={stats.presentClasses}
          bgColor="bg-blue-500"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
        <StatsCard
          title="Leave Classes"
          value={stats.leaveClasses}
          bgColor="bg-green-500"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Classes"
          value={stats.totalClasses}
          bgColor="bg-purple-500"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Quick Action */}
      <Card title="Quick Action">
        <Link
          to="/student/my-attendance"
          className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <div className="p-3 bg-blue-500 text-white rounded-lg mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">View Detailed Attendance</h3>
            <p className="text-sm text-gray-600">Check your subject-wise attendance records</p>
          </div>
        </Link>
      </Card>

      {/* Subject-wise Attendance */}
      <Card title="Subject-wise Attendance">
        {subjectStats.length > 0 ? (
          <div className="space-y-4">
            {subjectStats.map((subject) => (
              <div key={subject.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{subject.name}</h4>
                    <p className="text-sm text-gray-500">{subject.code}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subject.type === 'theory' ? 'bg-blue-100 text-blue-800' :
                    subject.type === 'lab' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {subject.type === 'theory+lab' ? 'Theory + Lab' : 
                     subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Theory */}
                  {(subject.type === 'theory' || subject.type === 'theory+lab') && (
                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Theory</span>
                        <span className={`font-semibold ${getPercentageColor(subject.theoryPercentage)}`}>
                          {subject.theoryPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getPercentageBg(subject.theoryPercentage)}`}
                          style={{ width: `${subject.theoryPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        P: {subject.theoryPresent} | L: {subject.theoryLeave} | A: {subject.theoryAbsent}
                      </p>
                    </div>
                  )}

                  {/* Lab */}
                  {(subject.type === 'lab' || subject.type === 'theory+lab') && (
                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Lab</span>
                        <span className={`font-semibold ${getPercentageColor(subject.labPercentage)}`}>
                          {subject.labPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getPercentageBg(subject.labPercentage)}`}
                          style={{ width: `${subject.labPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        P: {subject.labPresent} | L: {subject.labLeave} | A: {subject.labAbsent}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No attendance records found.</p>
          </div>
        )}
      </Card>

      {/* Attendance Alert */}
      {stats.overallPercentage < 75 && stats.totalClasses > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
          <div className="flex">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-800">Low Attendance Warning</h4>
              <p className="text-sm text-red-600">
                Your attendance is below 75%. Please attend more classes to avoid academic penalties.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
