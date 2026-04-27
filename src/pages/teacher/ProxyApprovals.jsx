import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { proxyService } from '../../services/dataService';
import { formatTo12Hour } from '../../utils/timeFormat';

const statusClasses = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
};

const ProxyApprovals = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const isHod = user?.role === 'teacher' && user?.priority === 'HOD';

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await proxyService.getHodRequests();
      setRequests(data);
    } catch {
      toast.error('Error loading proxy approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHod) {
      loadRequests();
    }
  }, [isHod]);

  const handleUpdate = async (requestId, status) => {
    try {
      setProcessingId(requestId);
      await proxyService.updateStatus(requestId, status);
      toast.success(`Proxy request ${status}`);
      await loadRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing request');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isHod) {
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
        <h1 className="text-2xl font-bold text-gray-800">Proxy Approval Panel</h1>
        <p className="text-gray-600">Review faculty proxy transfer requests.</p>
      </div>

      <Card>
        {requests.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No pending proxy requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-800">
                        {request.slot?.subject?.code} - {request.slot?.subject?.name}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[request.status]}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      {request.slot?.class?.name} • {request.date} • {request.slot?.dayOfWeek} • {formatTo12Hour(request.slot?.startTime?.slice(0, 5))}-{formatTo12Hour(request.slot?.endTime?.slice(0, 5))}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.originalFaculty?.name} ({request.originalFaculty?.employeeId}) → {request.proxyFaculty?.name} ({request.proxyFaculty?.employeeId})
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Reason: {request.reason || 'N/A'}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      disabled={processingId === request.id}
                      onClick={() => handleUpdate(request.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      disabled={processingId === request.id}
                      onClick={() => handleUpdate(request.id, 'rejected')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProxyApprovals;

