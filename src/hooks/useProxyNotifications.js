/**
 * useProxyNotifications
 *
 * Polls the direct-to-faculty proxy notification feed and manages the
 * sidebar badge + animated popup state.
 *
 * Key behaviours
 * ──────────────
 * • The backend tracks which requests are unread via `proxyFacultyViewedAt`,
 *   so the badge survives page refreshes and multi-tab use.
 * • The popup only animates in when a genuinely NEW request id appears (one
 *   that was not present on the previous poll).  On the very first load after
 *   login the popup fires only if there are truly unread requests waiting.
 * • `dismissedRequestIds` ensures that a request the user dismissed via ×
 *   does not reappear during the same session.
 * • `markAllRead` calls the backend and also clears local state so the badge
 *   vanishes immediately without waiting for the next poll.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { proxyService } from '../services/dataService';

export const PROXY_NOTIFICATIONS_REFRESH_EVENT = 'sal:proxy-notifications-refresh';

/** How often to poll (ms) */
const POLL_INTERVAL_MS = 5_000;

export const useProxyNotifications = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const teacherId = user?.id;

  const [requests, setRequests]       = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [loading, setLoading]         = useState(false);

  /** Ids seen on the previous successful poll */
  const knownRequestIds    = useRef(new Set());
  /** Ids the user dismissed via × in this session */
  const dismissedRequestIds = useRef(new Set());
  /** Last known status for requests created by this teacher */
  const outgoingStatuses = useRef(new Map());
  /** True only for the very first fetch after mount */
  const isFirstLoad = useRef(true);

  const refresh = useCallback(async ({ showSpinner = false } = {}) => {
    if (!isTeacher || !teacherId) return;

    if (showSpinner) setLoading(true);

    try {
      const [result, outgoingRequests] = await Promise.all([
        proxyService.getNotifications(),
        proxyService.getMyRequests()
      ]);
      const incoming = Array.isArray(result.data) ? result.data : [];

      setRequests(incoming);
      setUnreadCount(result.unreadCount ?? result.count ?? 0);
      setPendingCount(result.pendingCount ?? result.count ?? 0);

      if (Array.isArray(outgoingRequests)) {
        const currentStatuses = new Map();
        outgoingRequests.forEach((request) => {
          const previousStatus = outgoingStatuses.current.get(request.id);
          if (previousStatus === 'pending' && request.status !== 'pending') {
            const decision = request.status === 'approved' ? 'approved' : 'rejected';
            toast.info(`Your Proxy Lecture request was ${decision}${request.proxyFaculty?.name ? ` by ${request.proxyFaculty.name}` : ''}.`);
          }
          currentStatuses.set(request.id, request.status);
        });
        outgoingStatuses.current = currentStatuses;
      }

      const currentIds = new Set(incoming.map((r) => r.id));

      // Find any id that is both brand-new AND not dismissed by the user
      const hasNewRequest = incoming.some(
        (r) =>
          !knownRequestIds.current.has(r.id) &&
          !dismissedRequestIds.current.has(r.id)
      );

      if (hasNewRequest) {
        // A genuinely new request arrived → show popup
        setPopupVisible(true);
      } else if (isFirstLoad.current && currentIds.size > 0) {
        // First load: show popup only if there are unread requests
        // (i.e., the user has pending requests they haven't seen yet)
        setPopupVisible(true);
      }

      knownRequestIds.current = currentIds;
      isFirstLoad.current = false;
    } catch (error) {
      console.error('Error refreshing proxy notifications:', error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [isTeacher, teacherId]);

  /* ── Mount / unmount effect ── */
  useEffect(() => {
    if (!isTeacher) {
      setRequests([]);
      setUnreadCount(0);
      setPendingCount(0);
      setPopupVisible(false);
      knownRequestIds.current     = new Set();
      dismissedRequestIds.current = new Set();
      outgoingStatuses.current = new Map();
      isFirstLoad.current         = true;
      return undefined;
    }

    // Reset state on login
    isFirstLoad.current         = true;
    knownRequestIds.current     = new Set();
    dismissedRequestIds.current = new Set();
    outgoingStatuses.current = new Map();
    setRequests([]);
    setUnreadCount(0);
    setPendingCount(0);
    setPopupVisible(false);

    refresh({ showSpinner: true });

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_INTERVAL_MS);

    const handleRefreshEvent = () => refresh({ showSpinner: true });
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener(PROXY_NOTIFICATIONS_REFRESH_EVENT, handleRefreshEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(PROXY_NOTIFICATIONS_REFRESH_EVENT, handleRefreshEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [isTeacher, teacherId, refresh]);

  /**
   * Called when the user clicks × on the popup.
   * Records the dismissed ids so they don't reappear this session.
   */
  const dismissPopup = useCallback(() => {
    requests.forEach((r) => dismissedRequestIds.current.add(r.id));
    setPopupVisible(false);
  }, [requests]);

  /**
   * Called when the user clicks "Review request".
   * Marks requests as read and hides the popup; pending count remains visible.
   */
  const markAllRead = useCallback(async () => {
    try {
      await proxyService.markNotificationsRead();
    } catch (error) {
      console.error('Error marking proxy notifications read:', error);
    } finally {
      // Clear the unread indicator immediately regardless of API outcome.
      setUnreadCount(0);
      setPopupVisible(false);
    }
  }, []);

  return {
    requests,
    unreadCount,
    pendingCount,
    popupVisible,
    latestRequest: requests[0] ?? null,
    loading,
    dismissPopup,
    markAllRead,
    refresh,
  };
};
