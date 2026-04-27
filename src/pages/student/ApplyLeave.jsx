/**
 * SAL Education - Apply Leave Page (Student)
 *
 * Students can submit leave applications and view their own leave history.
 * The form shows the resolved student information and reviewer target.
 */

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Card, Button, Input, Select } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { attendanceService, leaveService } from '../../services/dataService';
import { LEAVE_TARGET_LABELS, LEAVE_TARGET_OPTIONS } from '../../constants/roles';

const ApplyLeave = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    sentTo: 'BOTH'
  });
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    if (!formData.fromDate || !formData.toDate) {
      setTotalDays(0);
      return;
    }

    const from = new Date(`${formData.fromDate}T00:00:00`);
    const to = new Date(`${formData.toDate}T00:00:00`);
    let days = 0;
    const current = new Date(from);

    while (current <= to) {
      if (current.getDay() !== 0) {
        days += 1;
      }
      current.setDate(current.getDate() + 1);
    }

    setTotalDays(Math.max(0, days));
  }, [formData.fromDate, formData.toDate]);

  const loadPageData = async () => {
    setLoading(true);

    try {
      const [leaveData, dashboardData] = await Promise.all([
        leaveService.getMyLeaves(),
        attendanceService.getStudentDashboard()
      ]);

      setLeaves(leaveData);
      setStudentInfo({
        id: dashboardData?.student?.id || user?.id,
        enrollmentNo: dashboardData?.student?.enrollmentNo || user?.enrollmentNo || 'N/A',
        name: dashboardData?.student?.name || user?.name || 'Student',
        className: dashboardData?.student?.class?.name || 'N/A',
        department: dashboardData?.student?.class?.department || ''
      });
    } catch (error) {
      toast.error('Error loading leave details');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalDays < 1) {
      toast.error('Leave must be for at least 1 working day');
      return;
    }

    if (formData.reason.trim().length < 5) {
      toast.error('Reason must be at least 5 characters');
      return;
    }

    setSubmitting(true);

    try {
      await leaveService.apply({
        ...formData,
        reason: formData.reason.trim()
      });
      toast.success('Leave application submitted successfully');
      setFormData({
        fromDate: '',
        toDate: '',
        reason: '',
        sentTo: 'BOTH'
      });
      setShowForm(false);
      await loadPageData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Applications</h1>
          <p className="text-gray-600">Apply for leave and track only your own requests</p>
        </div>
        <Button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded-lg font-medium"
        >
          {showForm ? 'Cancel' : '+ Apply for Leave'}
        </Button>
      </div>

      <Card title="Student Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Student ID" id="studentId" value={studentInfo?.enrollmentNo || studentInfo?.id || ''} disabled />
          <Input label="Name" id="studentName" value={studentInfo?.name || ''} disabled />
          <Input label="Class" id="studentClass" value={studentInfo?.className || ''} disabled />
        </div>
      </Card>

      {showForm && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">New Leave Application</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="From Date"
                id="fromDate"
                type="date"
                value={formData.fromDate}
                onChange={handleFormChange}
                required
              />
              <Input
                label="To Date"
                id="toDate"
                type="date"
                value={formData.toDate}
                onChange={handleFormChange}
                min={formData.fromDate}
                required
              />
            </div>

            <Select
              label="Send To"
              id="sentTo"
              value={formData.sentTo}
              onChange={handleFormChange}
              options={LEAVE_TARGET_OPTIONS}
              required
            />

            {totalDays > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 font-medium">
                  Total Leave Days: <span className="text-lg">{totalDays}</span>
                  <span className="text-sm text-blue-500 ml-2">(excluding Sundays)</span>
                </p>
              </div>
            )}

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="reason"
                value={formData.reason}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Please provide a detailed reason for your leave..."
                required
                minLength={5}
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1">{formData.reason.length}/1000 characters</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || totalDays < 1}
                className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">My Leave History</h2>
            <p className="text-sm text-gray-500">Only your applications are shown here</p>
          </div>
        </div>

        {leaves.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No leave applications yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">From</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">To</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Days</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Send To</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Reviewed By</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Decision Date</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave, index) => (
                  <tr key={leave.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4">{new Date(leave.fromDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{new Date(leave.toDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">{leave.totalDays}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{LEAVE_TARGET_LABELS[leave.sentTo] || leave.sentTo}</td>
                    <td className="py-3 px-4">{getStatusBadge(leave.status)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {leave.approver?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {leave.decisionDate ? new Date(leave.decisionDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApplyLeave;
