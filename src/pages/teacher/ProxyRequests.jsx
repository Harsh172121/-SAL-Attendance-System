import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Card, Button } from '../../components';
import { proxyService } from '../../services/dataService';
import { formatTo12Hour } from '../../utils/timeFormat';

const statusClasses = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
};

const ProxyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await proxyService.getMyRequests();
      setRequests(data);
    } catch {
      toast.error('Error loading proxy requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const counts = useMemo(() => ({
    pending: requests.filter((item) => item.status === 'pending').length,
    approved: requests.filter((item) => item.status === 'approved').length,
    rejected: requests.filter((item) => item.status === 'rejected').length
  }), [requests]);

  const filtered = useMemo(
    () => requests.filter((item) => item.status === filter),
    [requests, filter]
  );

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
        <h1 className="text-2xl font-bold text-gray-800">My Proxy Requests</h1>
        <p className="text-gray-600">Track request status sent for HOD approval.</p>
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
        {filtered.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No {filter} proxy requests.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((request) => (
              <div key={request.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {request.slot?.subject?.code} - {request.slot?.subject?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.slot?.class?.name} • {request.date} • {formatTo12Hour(request.slot?.startTime?.slice(0, 5))}-{formatTo12Hour(request.slot?.endTime?.slice(0, 5))}
                    </p>
                    <p className="text-sm text-gray-600">
                      Proxy Faculty: {request.proxyFaculty?.name} ({request.proxyFaculty?.employeeId})
                    </p>
                    <p className="text-sm text-gray-500">Reason: {request.reason || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[request.status]}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 text-right">
          <Button onClick={loadRequests} variant="outline">Refresh</Button>
        </div>
      </Card>
    </div>
  );
};

export default ProxyRequests;

