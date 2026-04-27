/**
 * SAL Education - Leave Requests Page (Teacher)
 *
 * Only HOD/class coordinator/elevated teacher priorities can access this page.
 * The API already scopes the data to the current reviewer.
 */

import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { leaveService } from '../../services/dataService';
import { LEAVE_TARGET_LABELS, formatTeacherPriority } from '../../constants/roles';

const LeaveRequests = () => {
  const { user, canReviewLeaves } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (canReviewLeaves) {
      loadLeaves();
    }
  }, [canReviewLeaves]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getLeaveRequests();
      setLeaves(data);
    } catch (error) {
      toast.error('Error loading leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await leaveService.reviewLeave(id, { status, adminNote });
      toast.success(`Leave ${status} successfully`);
      setReviewingId(null);
      setAdminNote('');
      await loadLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || `Error ${status === 'approved' ? 'approving' : 'rejecting'} leave`);
    }
  };

  const filteredLeaves = useMemo(
    () => leaves.filter((leave) => leave.status === filter),
    [filter, leaves]
  );

  const counts = useMemo(() => ({
    pending: leaves.filter((leave) => leave.status === 'pending').length,
    approved: leaves.filter((leave) => leave.status === 'approved').length,
    rejected: leaves.filter((leave) => leave.status === 'rejected').length
  }), [leaves]);

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

  if (!canReviewLeaves) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Student Leave Requests</h1>
        <p className="text-gray-600">
          {formatTeacherPriority(user?.priority)} dashboard for reviewing leave requests routed to you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-yellow-700">{counts.pending}</p>
          <p className="text-sm text-yellow-600">Pending</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-700">{counts.approved}</p>
          <p className="text-sm text-green-600">Approved</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-700">{counts.rejected}</p>
          <p className="text-sm text-red-600">Rejected</p>
        </div>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {['pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
              filter === tab
                ? 'bg-blue-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      <Card>
        {filteredLeaves.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No {filter} leave requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeaves.map((leave) => (
              <div key={leave.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex flex-col gap-4 xl:flex-row xl:justify-between xl:items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {leave.student?.name || 'Unknown Student'}
                      </h3>
                      {getStatusBadge(leave.status)}
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Sent To: {LEAVE_TARGET_LABELS[leave.sentTo] || leave.sentTo}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Enrollment:</span>{' '}
                        {leave.student?.enrollmentNo || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Class:</span>{' '}
                        {leave.class?.name || '-'}
                      </div>
                      <div>
                        <span className="font-medium">From:</span>{' '}
                        {new Date(leave.fromDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">To:</span>{' '}
                        {new Date(leave.toDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Duration:</span>{' '}
                      {leave.totalDays} working day{leave.totalDays > 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Reason:</span> {leave.reason}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Coordinator:</span> {leave.coordinator?.name || '-'}
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="font-medium">HOD:</span> {leave.hod?.name || '-'}
                    </div>

                    {leave.adminNote && (
                      <div className="mt-2 bg-gray-100 border border-gray-200 rounded p-2 text-sm">
                        <span className="font-medium text-gray-700">Note:</span> {leave.adminNote}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-2">
                      Applied on {new Date(leave.createdAt).toLocaleDateString()}
                      {leave.decisionDate ? ` | Decided on ${new Date(leave.decisionDate).toLocaleDateString()}` : ''}
                    </div>
                  </div>

                  {leave.status === 'pending' && (
                    <div className="xl:ml-4">
                      {reviewingId === leave.id ? (
                        <div className="space-y-2 w-full xl:w-72">
                          <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Optional note..."
                            maxLength={500}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleReview(leave.id, 'approved')}
                              className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReview(leave.id, 'rejected')}
                              className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </Button>
                            <Button
                              onClick={() => {
                                setReviewingId(null);
                                setAdminNote('');
                              }}
                              className="px-3 py-1.5 border text-gray-600 rounded text-sm hover:bg-gray-100"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setReviewingId(leave.id)}
                          className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900"
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LeaveRequests;
