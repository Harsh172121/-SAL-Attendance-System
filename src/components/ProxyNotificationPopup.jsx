/**
 * Animated proxy request notification card.
 * Anchored to the "Incoming Proxy Requests" sidebar link by the Sidebar.
 */

import { Link } from 'react-router-dom';
import { formatTo12Hour } from '../utils/timeFormat';

const ProxyNotificationPopup = ({ request, unreadCount, onDismiss, onOpen }) => {
  const subject = request?.slot?.subject;
  const className = request?.slot?.class;
  const startTime = formatTo12Hour(request?.slot?.startTime?.slice(0, 5));
  const endTime = formatTo12Hour(request?.slot?.endTime?.slice(0, 5));

  return (
    <div
      role="status"
      aria-live="polite"
      className="proxy-popup absolute left-full top-0 z-50 ml-4 w-[19rem] max-w-[calc(100vw-18rem)]"
    >
      {/* Arrow pointing back to the sidebar link */}
      <span
        aria-hidden="true"
        className="absolute -left-2 top-7 h-4 w-4 rotate-45 rounded-sm border-b border-l border-blue-100 bg-white"
      />

      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_20px_50px_-18px_rgba(30,64,175,0.45)]">
        <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-green-500" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <span className="proxy-icon-ring absolute inset-0 rounded-xl border-2 border-blue-400" />
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  New proxy request
                </p>
                {unreadCount > 1 && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                    {unreadCount} pending
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-5 text-gray-600">
                A new request has arrived, please check.
              </p>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-1 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {subject && (
            <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="truncate text-sm font-medium text-gray-800">
                {subject.code} - {subject.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {[className?.name, request.date, startTime && `${startTime} - ${endTime}`]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
              {request.originalFaculty?.name && (
                <p className="mt-1 text-xs text-gray-500">
                  From {request.originalFaculty.name}
                </p>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <Link
              to="/teacher/proxy-incoming"
              onClick={onOpen}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Review request
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <span className="text-[11px] text-gray-400">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProxyNotificationPopup;
