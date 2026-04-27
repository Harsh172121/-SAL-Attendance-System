import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../components';
import { proxyService } from '../../services/dataService';
import { formatTo12Hour } from '../../utils/timeFormat';

const ProxyLectures = () => {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLectures = async () => {
    setLoading(true);
    try {
      const data = await proxyService.getMyProxyLectures();
      setLectures(data);
    } catch {
      toast.error('Error loading proxy lectures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLectures();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-800">Assigned Proxy Lectures</h1>
        <p className="text-gray-600">Lectures delegated to you after HOD approval.</p>
      </div>

      <Card>
        {lectures.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No approved proxy lectures assigned.</p>
        ) : (
          <div className="space-y-4">
            {lectures.map((row) => (
              <div key={row.id} className="rounded-lg border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-gray-800">
                    {row.slot?.subject?.code} - {row.slot?.subject?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {row.slot?.class?.name} • {row.date} • {row.slot?.dayOfWeek} • {formatTo12Hour(row.slot?.startTime?.slice(0, 5))}-{formatTo12Hour(row.slot?.endTime?.slice(0, 5))}
                  </p>
                  <p className="text-sm text-gray-600">
                    Original Faculty: {row.originalFaculty?.name} ({row.originalFaculty?.employeeId})
                  </p>
                </div>

                <Button
                  onClick={() =>
                    navigate(
                      `/teacher/mark-attendance?subjectId=${row.slot.subjectId}&classId=${row.slot.classId}&slotId=${row.slot.id}&date=${row.date}&type=${row.slot.type}${row.slot.batchId ? `&batchId=${row.slot.batchId}` : ''}&subjectName=${encodeURIComponent(row.slot?.subject?.name || '')}&subjectCode=${encodeURIComponent(row.slot?.subject?.code || '')}`
                    )
                  }
                >
                  Mark Attendance
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 text-right">
          <Button onClick={loadLectures} variant="outline">Refresh</Button>
        </div>
      </Card>
    </div>
  );
};

export default ProxyLectures;

