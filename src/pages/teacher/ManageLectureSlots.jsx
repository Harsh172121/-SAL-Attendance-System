/**
 * SAL Education - Manage Lecture Slots Page
 * 
 * Faculty can create, view, edit, and delete their lecture timetable slots.
 * VIVA NOTE: This page provides a full timetable view grouped by day
 * and a form to add/edit slots with overlap validation.
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, ConfirmDialog, TimeInput } from '../../components';
import { lectureSlotService, attendanceService, classroomService, proxyService } from '../../services/dataService';
import { formatTo12Hour } from '../../utils/timeFormat';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ManageLectureSlots = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [proxyFacultyOptions, setProxyFacultyOptions] = useState([]);
  const [proxySuggestions, setProxySuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [myProxyRequests, setMyProxyRequests] = useState([]);
  const [myProxyLectures, setMyProxyLectures] = useState([]);
  const [proxyForm, setProxyForm] = useState({
    slotId: '',
    date: new Date().toISOString().split('T')[0],
    proxyFacultyId: '',
    reason: ''
  });
  const [proxySubmitting, setProxySubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subjectId: '',
    classId: '',
    batchId: '',
    classroomId: '',
    type: 'theory',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: ''
  });

  async function loadData() {
    setLoading(true);
    try {
      const [slotsRes, subjectsData, classroomData] = await Promise.all([
        lectureSlotService.getAll(),
        attendanceService.getMySubjects(),
        classroomService.getAll()
      ]);
      setSlots(slotsRes.data || []);
      setTimetable(slotsRes.timetable || {});
      setSubjects(subjectsData || []);
      setClassrooms(classroomData || []);
      const [proxyFaculty, existingRequests, proxyLectures] = await Promise.all([
        proxyService.getFacultyOptions(),
        proxyService.getMyRequests(),
        proxyService.getMyProxyLectures()
      ]);
      setProxyFacultyOptions(proxyFaculty || []);
      setMyProxyRequests(existingRequests || []);
      setMyProxyLectures(proxyLectures || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleSubjectChange = async (subjectId) => {
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    if (subject) {
      setFormData(prev => ({
        ...prev,
        subjectId,
        classId: subject.class?.id || subject.classId || '',
        type: subject.teachingType === 'lab' ? 'lab' : 'theory',
        batchId: ''
      }));
      if (subject.teachingType === 'lab' || subject.teachingType === 'both') {
        const batchData = await attendanceService.getBatchesForSubject(subjectId);
        setBatches(batchData || []);
      } else {
        setBatches([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        subjectId: parseInt(formData.subjectId),
        classId: parseInt(formData.classId),
        classroomId: parseInt(formData.classroomId),
        batchId: formData.type === 'lab' && formData.batchId ? parseInt(formData.batchId) : null
      };

      if (editingSlot) {
        await lectureSlotService.update(editingSlot.id, payload);
        toast.success('Lecture slot updated successfully');
      } else {
        await lectureSlotService.create(payload);
        toast.success('Lecture slot created successfully');
      }
      setShowModal(false);
      setEditingSlot(null);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving lecture slot');
    }
  };

  const handleEdit = async (slot) => {
    setEditingSlot(slot);
    setFormData({
      subjectId: slot.subjectId.toString(),
      classId: slot.classId.toString(),
      batchId: slot.batchId ? slot.batchId.toString() : '',
      classroomId: slot.classroomId ? slot.classroomId.toString() : '',
      type: slot.type,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime?.slice(0, 5) || '',
      endTime: slot.endTime?.slice(0, 5) || ''
    });
    // Load batches if lab type
    if (slot.type === 'lab') {
      const batchData = await attendanceService.getBatchesForSubject(slot.subjectId);
      setBatches(batchData || []);
    }
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await lectureSlotService.delete(deleteId);
      toast.success('Lecture slot deleted');
      setDeleteId(null);
      loadData();
    } catch {
      toast.error('Error deleting lecture slot');
    }
  };

  const resetForm = () => {
    setFormData({
      subjectId: '',
      classId: '',
      batchId: '',
      classroomId: '',
      type: 'theory',
      dayOfWeek: 'Monday',
      startTime: '',
      endTime: ''
    });
    setBatches([]);
  };

  const openAddModal = () => {
    setEditingSlot(null);
    resetForm();
    setShowModal(true);
  };

  const getSelectedSubject = () => {
    return subjects.find(s => s.id === parseInt(formData.subjectId));
  };

  const openProxyModal = async (slot) => {
    const defaultDate = new Date().toISOString().split('T')[0];
    setProxyForm({
      slotId: slot.id,
      date: defaultDate,
      proxyFacultyId: '',
      reason: ''
    });
    setShowProxyModal(true);
    loadProxySuggestions(slot.id, defaultDate);
  };

  const loadProxySuggestions = async (slotId, date) => {
    setLoadingSuggestions(true);
    try {
      const data = await proxyService.getSuggestions(slotId, date);
      setProxySuggestions(data || []);
    } catch (error) {
      console.error('Error loading proxy suggestions:', error);
      setProxySuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleProxyDateChange = (date) => {
    setProxyForm(prev => ({ ...prev, date }));
    loadProxySuggestions(proxyForm.slotId, date);
  };

  const isProxyRequestedForSlotDate = (slotId, dateValue) => {
    return myProxyRequests.some(
      (request) =>
        Number(request.slotId) === Number(slotId) &&
        request.date === dateValue &&
        ['pending', 'approved'].includes(request.status)
    );
  };

  const getSlotRequestStatusForDate = (slotId, dateValue) => {
    return myProxyRequests.find(
      (request) => Number(request.slotId) === Number(slotId) && request.date === dateValue
    )?.status || null;
  };

  const handleProxyRequestSubmit = async (e) => {
    e.preventDefault();

    if (!proxyForm.slotId || !proxyForm.proxyFacultyId || !proxyForm.date) {
      toast.error('Please select proxy faculty and date');
      return;
    }

    if (isProxyRequestedForSlotDate(proxyForm.slotId, proxyForm.date)) {
      toast.error('Proxy request already exists for selected slot/date');
      return;
    }

    setProxySubmitting(true);
    try {
      await proxyService.createRequest({
        slotId: Number(proxyForm.slotId),
        proxyFacultyId: Number(proxyForm.proxyFacultyId),
        date: proxyForm.date,
        reason: proxyForm.reason?.trim() || undefined
      });
      toast.success('Proxy request sent for HOD approval');
      setShowProxyModal(false);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit proxy request');
    } finally {
      setProxySubmitting(false);
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Lecture Timetable</h1>
          <p className="text-gray-600">Manage your weekly lecture schedule</p>
        </div>
        <Button
          onClick={openAddModal}
          disabled={classrooms.length === 0}
          className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded-lg font-medium"
        >
          + Add Lecture Slot
        </Button>
      </div>

      {classrooms.length === 0 && (
        <Card>
          <p className="text-sm text-amber-700">
            No classrooms are available yet. Ask an admin to add classroom numbers before creating lecture slots.
          </p>
        </Card>
      )}

      {/* Timetable View */}
      {slots.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No lecture slots added yet</p>
            <p className="text-gray-400">Click "Add Lecture Slot" to create your timetable</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {DAYS.map(day => {
            const daySlots = timetable[day] || [];
            if (daySlots.length === 0) return null;
            return (
              <Card key={day}>
                <h3 className="text-lg font-semibold text-blue-800 mb-3 border-b pb-2">{day}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {daySlots.map(slot => {
                    const todayDate = new Date().toISOString().split('T')[0];
                    const todayStatus = getSlotRequestStatusForDate(slot.id, todayDate);
                    const isTodayBlocked = todayStatus === 'pending' || todayStatus === 'approved';

                    return (
                    <div key={slot.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-blue-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {slot.subject?.code} - {slot.subject?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {slot.class?.name} • {slot.class?.department}
                          </p>
                          <p className="text-sm text-gray-600">
                            Sem {slot.class?.semester}
                            {slot.batch && ` • Batch: ${slot.batch.name}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Classroom: {slot.classroom?.classroomNumber || 'Unassigned'}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              slot.type === 'theory' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {slot.type.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-green-700">
                              {formatTo12Hour(slot.startTime?.slice(0, 5))} - {formatTo12Hour(slot.endTime?.slice(0, 5))}
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/teacher/mark-attendance?subjectId=${slot.subjectId}&classId=${slot.classId}&slotId=${slot.id}&date=${new Date().toISOString().split('T')[0]}&type=${slot.type}${slot.batchId ? `&batchId=${slot.batchId}` : ''}&subjectName=${encodeURIComponent(slot.subject?.name || '')}&subjectCode=${encodeURIComponent(slot.subject?.code || '')}`
                                  )
                                }
                                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                              >
                                Mark Attendance
                              </button>
                              <button
                                onClick={() => openProxyModal(slot)}
                                disabled={isTodayBlocked}
                                className="rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-600"
                              >
                                {isTodayBlocked ? `Proxy ${todayStatus}` : 'Request Proxy'}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(slot)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setDeleteId(slot.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingSlot(null); }}
        title={editingSlot ? 'Edit Lecture Slot' : 'Add Lecture Slot'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <select
              value={formData.subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.class?.name}) [{s.teachingType}]
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, batchId: '' }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {(() => {
                const subject = getSelectedSubject();
                if (!subject) return <option value="theory">Theory</option>;
                const opts = [];
                if (subject.teachingType === 'theory' || subject.teachingType === 'both')
                  opts.push(<option key="theory" value="theory">Theory</option>);
                if (subject.teachingType === 'lab' || subject.teachingType === 'both')
                  opts.push(<option key="lab" value="lab">Lab</option>);
                return opts.length > 0 ? opts : <option value="theory">Theory</option>;
              })()}
            </select>
          </div>

          {/* Batch (for lab) */}
          {formData.type === 'lab' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
              <select
                value={formData.batchId}
                onChange={(e) => setFormData(prev => ({ ...prev, batchId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Batch</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Day of Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week *</label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {DAYS.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Classroom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classroom Number *</label>
            <select
              value={formData.classroomId}
              onChange={(e) => setFormData(prev => ({ ...prev, classroomId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Classroom</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.classroomNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <TimeInput
              label="Start Time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            />
            <TimeInput
              label="End Time"
              required
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={() => { setShowModal(false); setEditingSlot(null); }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={classrooms.length === 0}
              className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
            >
              {editingSlot ? 'Update Slot' : 'Add Slot'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Lecture Slot"
        message="Are you sure you want to delete this lecture slot? This action cannot be undone."
      />

      <Card title="Assigned Proxy Lectures">
        {myProxyLectures.length === 0 ? (
          <p className="text-sm text-gray-500">No approved proxy lectures assigned to you.</p>
        ) : (
          <div className="space-y-3">
            {myProxyLectures.map((row) => (
              <div key={row.id} className="rounded-lg border p-3 bg-white">
                <p className="font-medium text-gray-800">
                  {row.slot?.subject?.code} - {row.slot?.subject?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {row.slot?.class?.name} • {row.date} • {row.slot?.dayOfWeek} • {formatTo12Hour(row.slot?.startTime?.slice(0, 5))}-{formatTo12Hour(row.slot?.endTime?.slice(0, 5))}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Original Faculty: {row.originalFaculty?.name || 'N/A'}
                </p>
                <button
                  onClick={() =>
                    navigate(
                      `/teacher/mark-attendance?subjectId=${row.slot.subjectId}&classId=${row.slot.classId}&slotId=${row.slot.id}&date=${row.date}&type=${row.slot.type}${row.slot.batchId ? `&batchId=${row.slot.batchId}` : ''}&subjectName=${encodeURIComponent(row.slot?.subject?.name || '')}&subjectCode=${encodeURIComponent(row.slot?.subject?.code || '')}`
                    )
                  }
                  className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                >
                  Mark Proxy Attendance
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showProxyModal}
        onClose={() => setShowProxyModal(false)}
        title="Request Proxy Lecture"
      >
        <form onSubmit={handleProxyRequestSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              value={proxyForm.date}
              onChange={(e) => handleProxyDateChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proxy Faculty * {loadingSuggestions && <span className="text-xs text-blue-600 animate-pulse ml-2">Loading free faculty...</span>}
            </label>
            <select
              value={proxyForm.proxyFacultyId}
              onChange={(e) => setProxyForm((prev) => ({ ...prev, proxyFacultyId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select faculty</option>
              {proxySuggestions.length > 0 ? (
                <>
                  <optgroup label="Suggested (Free & Available)">
                    {proxySuggestions.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.employeeId}) {teacher.isSameDepartment ? ' [Same Dept]' : ''}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="All Faculty">
                    {proxyFacultyOptions.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.employeeId})
                      </option>
                    ))}
                  </optgroup>
                </>
              ) : (
                proxyFacultyOptions.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.employeeId})
                  </option>
                ))
              )}
            </select>
            {proxySuggestions.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                Suggestions are based on faculty who are free during this time slot on the selected date.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <textarea
              value={proxyForm.reason}
              onChange={(e) => setProxyForm((prev) => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={500}
              placeholder="Reason for proxy request..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowProxyModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={proxySubmitting}>
              {proxySubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageLectureSlots;
