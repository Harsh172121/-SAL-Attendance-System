/**
 * ProxyNotificationPopup
 *
 * A polished, animated notification card that is anchored to the
 * "Incoming Proxy Requests" sidebar link.  It slides in from the left with a
 * spring bounce, displays key request details, and auto-dismisses after a
 * configurable timeout.  The dismiss-button also triggers an exit animation
 * before actually removing the element.
 *
 * Props
 * ─────
 *  request      – The latest unread ProxyRequest object (may be null).
 *  unreadCount  – Total number of unread pending requests (for the badge).
 *  onDismiss    – Called when the user clicks × or the auto-timer fires.
 *  onOpen       – Called when the user clicks "Review request".
 *  autoDismissMs – (optional) Auto-dismiss delay in ms. 0 = never. Default 12000.
 */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTo12Hour } from '../utils/timeFormat';

const AUTO_DISMISS_MS_DEFAULT = 12_000;

const ProxyNotificationPopup = ({
  request,
  unreadCount,
  onDismiss,
  onOpen,
  autoDismissMs = AUTO_DISMISS_MS_DEFAULT,
}) => {
  /* ---- exit-animation state ---- */
  const [exiting, setExiting] = useState(false);
  const timerRef  = useRef(null);
  const progressRef = useRef(null);

  /* Trigger the CSS exit animation, then call the parent dismissal */
  const handleDismiss = () => {
    if (exiting) return;
    setExiting(true);
    clearTimeout(timerRef.current);
    // Wait for the exit animation to finish before unmounting
    setTimeout(onDismiss, 220);
  };

  /* Auto-dismiss timer */
  useEffect(() => {
    if (autoDismissMs <= 0) return undefined;

    timerRef.current = setTimeout(handleDismiss, autoDismissMs);

    /* Kick off the draining progress bar */
    if (progressRef.current) {
      progressRef.current.style.animationDuration = `${autoDismissMs}ms`;
    }

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id, autoDismissMs]);

  /* ---- derived display values ---- */
  const subject    = request?.slot?.subject;
  const cls        = request?.slot?.class;
  const startTime  = formatTo12Hour(request?.slot?.startTime?.slice(0, 5));
  const endTime    = formatTo12Hour(request?.slot?.endTime?.slice(0, 5));

  /* Relative "just now / X min ago" timestamp */
  const getRelativeTime = () => {
    if (!request?.createdAt) return 'Just now';
    const diff = Math.round((Date.now() - new Date(request.createdAt)) / 60_000);
    if (diff < 1) return 'Just now';
    if (diff === 1) return '1 min ago';
    return `${diff} min ago`;
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`${exiting ? 'proxy-popup-exit' : 'proxy-popup'} absolute left-full top-0 z-50 ml-4 w-[21rem] max-w-[calc(100vw-17rem)]`}
    >
      {/* ── Arrow pointing back to the sidebar link ── */}
      <span
        aria-hidden="true"
        className="absolute -left-2 top-6 h-4 w-4 rotate-45 rounded-sm border-b border-l border-blue-100 bg-white shadow-sm"
      />

      {/* ── Card shell ── */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_24px_60px_-16px_rgba(30,64,175,0.5),0_4px_16px_-4px_rgba(0,0,0,0.08)]">

        {/* Top accent bar with animated shimmer */}
        <div className="proxy-shimmer-bar h-1 w-full" aria-hidden="true" />

        {/* Auto-dismiss progress bar (drains left-to-right under the accent) */}
        {autoDismissMs > 0 && (
          <div className="h-0.5 bg-blue-50" aria-hidden="true">
            <div
              ref={progressRef}
              className="proxy-progress-bar h-full bg-blue-300 origin-left"
              style={{ animationDuration: `${autoDismissMs}ms` }}
            />
          </div>
        )}

        <div className="p-4">
          {/* ── Header row ── */}
          <div className="flex items-start gap-3">

            {/* Bell icon with ripple ring */}
            <div className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-inner">
              <span className="proxy-icon-ring absolute inset-0 rounded-xl border-2 border-blue-400" aria-hidden="true" />
              <svg
                className="proxy-bell-shake h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
                     6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6
                     8.388 6 11v3.159c0 .538-.214 1.055-.595
                     1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>

            {/* Text block */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  New Proxy Lecture request
                </p>
                {unreadCount > 1 && (
                  <span className="proxy-badge-pulse inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold leading-none text-white shadow">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-snug text-gray-600">
                A new Proxy Lecture request has arrived. Please check.
              </p>
            </div>

            {/* Dismiss × button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Request detail card (shows only when subject data is available) ── */}
          {subject && (
            <div className="mt-3 rounded-xl border border-blue-50 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 px-3.5 py-3">
              {/* Subject */}
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="truncate text-sm font-semibold text-gray-800">
                  {subject.code}&nbsp;&mdash;&nbsp;{subject.name}
                </p>
              </div>

              {/* Class · Date · Time */}
              {(cls?.name || request.date || startTime) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {cls?.name && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200/80">
                      <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {cls.name}
                    </span>
                  )}
                  {request.date && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200/80">
                      <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {request.date}
                    </span>
                  )}
                  {startTime && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-gray-200/80">
                      <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {startTime}&nbsp;–&nbsp;{endTime}
                    </span>
                  )}
                </div>
              )}

              {/* Requested by */}
              {request.originalFaculty?.name && (
                <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>
                    From&nbsp;
                    <span className="font-medium text-gray-700">{request.originalFaculty.name}</span>
                  </span>
                </p>
              )}
            </div>
          )}

          {/* ── Footer: CTA + timestamp ── */}
          <div className="mt-3.5 flex items-center justify-between gap-2">
            <Link
              to="/teacher/proxy-incoming"
              onClick={onOpen}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-900 hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              View Proxy Lecture requests
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <span className="text-[11px] text-gray-400">{getRelativeTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProxyNotificationPopup;
