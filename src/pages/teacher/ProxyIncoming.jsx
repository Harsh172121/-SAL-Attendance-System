import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, Button } from '../../components';
import { proxyService } from '../../services/dataService';
import { formatTo12Hour } from '../../utils/timeFormat';
import { PROXY_NOTIFICATIONS_REFRESH_EVENT } from '../../hooks/useProxyNotifications';

const statusClasses = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Accepted',
  rejected: 'Declined'
};

const ProxyIncoming = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);

  const notifySidebar = () => {
    window.dispatchEvent(new Event(PROXY_NOTIFICATIONS_REFRESH_EVENT));
  };

  const loadRequests = useCallback(async ({ markRead = false } = {}) => {
    setLoading(true);
    try {
      const data = await proxyService.getIncomingRequests();
      setRequests(data);

      if (markRead) {
        await proxyService.markNotificationsRead();
        notifySidebar();
      }
    } catch {
      toast.error('Error loading incoming proxy requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests({ markRead: true });

    const intervalId = window.setInterval(
      () => loadRequests({ markRead: true }),
      30000
    );

    return () => window.clearInterval(intervalId);
  }, [loadRequests]);

  const counts = useMemo(() => ({
    pending: requests.filter((item) => item.status === 'pending').length,
    approved: requests.filter((item) => item.status === 'approved').length,
    rejected: requests.filter((item) => item.status === 'rejected').length
  }), [requests]);

  const filtered = useMemo(
    () => requests.filter((item) => item.status === filter),
    [requests, filter]
  );

  const handleRespond = async (request, status) => {
    setProcessingId(request.id);
    try {
      await proxyService.respondToRequest(request.id, status);
      toast.success(
        status === 'approved'
          ? 'Request accepted. The proxy lecture is now assigned to you.'
          : 'Request declined.'
      );
      await loadRequests({ markRead: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error responding to request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incoming Proxy Requests</h1>
          <p className="text-gray-600">
            Requests sent directly to you by fellow faculty. Accept to take the lecture or decline to send it back.
          </p>
        </div>
        <Button onClick={() => loadRequests({ markRead: true })} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`rounded-lg border p-4 text-center transition-shadow hover:shadow-md ${
            filter === 'pending' ? 'border-yellow-300 ring-2 ring-yellow-200' : 'border-yellow-200'
          } bg-yellow-50`}
        >
          <p className="text-3xl font-bold text-yellow-700">{counts.pending}</p>
          <p className="text-sm text-yellow-600">Awaiting your response</p>
        </button>
        <button
          type="button"
          onClick={() => setFilter('approved')}
          className={`rounded-lg border p-4 text-center transition-shadow hover:shadow-md ${
            filter === 'approved' ? 'border-green-300 ring-2 ring-green-200' : 'border-green-200'
          } bg-green-50`}
        >
          <p className="text-3xl font-bold text-green-700">{counts.approved}</p>
          <p className="text-sm text-green-600">Accepted</p>
        </button>
        <button
          type="button"
          onClick={() => setFilter('rejected')}
          className={`rounded-lg border p-4 text-center transition-shadow hover:shadow-md ${
            filter === 'rejected' ? 'border-red-300 ring-2 ring-red-200' : 'border-red-200'
          } bg-red-50`}
        >
          <p className="text-3xl font-bold text-red-700">{counts.rejected}</p>
          <p className="text-sm text-red-600">Declined</p>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {['pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab
                ? 'bg-blue-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {statusLabels[tab]} ({counts[tab]})
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <svg
              className="mx-auto mb-4 h-14 w-14 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-500">
              No {statusLabels[filter].toLowerCase()} proxy requests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((request) => {
              const isProcessing = processingId === request.id;

              return (
                <div
                  key={request.id}
                  className="rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <p className="font-semibold text-gray-800">
                          {request.slot?.subject?.code} - {request.slot?.subject?.name}
                        </p>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[request.status]}`}>
                          {statusLabels[request.status]}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        {request.slot?.class?.name}
                        {request.slot?.class?.department && ` • ${request.slot.class.department}`}
                        {` • ${request.date}`}
                        {request.slot?.dayOfWeek && ` • ${request.slot.dayOfWeek}`}
                        {request.slot?.startTime && ` • ${formatTo12Hour(request.slot.startTime.slice(0, 5))}-${formatTo12Hour(request.slot.endTime.slice(0, 5))}`}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Requested by {request.originalFaculty?.name || 'a faculty member'}
                        {request.originalFaculty?.employeeId && ` (${request.originalFaculty.employeeId})`}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Reason: {request.reason || 'Not specified'}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {request.status === 'pending' ? (
                        <>
                          <Button
                            disabled={isProcessing}
                            onClick={() => handleRespond(request, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isProcessing ? 'Saving...' : 'Accept'}
                          </Button>
                          <Button
                            disabled={isProcessing}
                            onClick={() => handleRespond(request, 'rejected')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Decline
                          </Button>
                        </>
                      ) : request.status === 'approved' ? (
                        <Link
                          to="/teacher/proxy-lectures"
                          className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900"
                        >
                          View Proxy Lectures
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">No action needed</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProxyIncoming;
