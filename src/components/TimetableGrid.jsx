/**
 * TimetableGrid Component
 * 
 * A reusable grid component for displaying weekly schedules.
 */

import React from 'react';
import { formatTo12Hour } from '../utils/timeFormat';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TimetableGrid = ({ slots, onSlotClick, title }) => {
  // Group slots by day
  const timetable = DAYS.reduce((acc, day) => {
    acc[day] = slots
      .filter(s => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="flex border-b">
            {DAYS.map(day => (
              <div key={day} className="flex-1 min-w-[150px] p-3 text-center font-bold text-blue-800 bg-blue-50 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          
          <div className="flex divide-x">
            {DAYS.map(day => (
              <div key={day} className="flex-1 min-w-[150px] bg-white min-h-[400px]">
                {timetable[day].length > 0 ? (
                  timetable[day].map((slot, idx) => (
                    <div 
                      key={slot.id || idx} 
                      className={`p-3 m-2 rounded-lg border text-xs shadow-sm cursor-pointer hover:shadow-md transition-all ${
                        slot.isProxy 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-blue-50 border-blue-100'
                      }`}
                      onClick={() => onSlotClick && onSlotClick(slot)}
                    >
                      <div className="font-bold text-gray-800 mb-1">
                        {slot.subject?.code}
                      </div>
                      <div className="text-gray-700 font-medium truncate" title={slot.subject?.name}>
                        {slot.subject?.name}
                      </div>
                      <div className="mt-2 text-blue-700 font-semibold">
                        {slot.startTime ? formatTo12Hour(slot.startTime.slice(0, 5)) : 'N/A'} - {slot.endTime ? formatTo12Hour(slot.endTime.slice(0, 5)) : 'N/A'}
                      </div>
                      <div className="mt-1 text-gray-500">
                        Room: {slot.classroom?.name || slot.classroom?.classroomNumber || 'N/A'}
                      </div>
                      {slot.class && (
                        <div className="mt-1 font-medium text-gray-600">
                          Class: {slot.class.name}
                        </div>
                      )}
                      {slot.isProxy && (
                        <div className="mt-1 inline-block bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                          Proxy
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 text-xs italic">
                    No lectures
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;
