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
import { useAuth } from '../context/AuthContext';
import { proxyService } from '../services/dataService';

export const PROXY_NOTIFICATIONS_REFRESH_EVENT = 'sal:proxy-notifications-refresh';

/** How often to poll (ms) */
const POLL_INTERVAL_MS = 20_000;

export const useProxyNotifications = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [requests, setRequests]       = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [loading, setLoading]         = useState(false);

  /** Ids seen on the previous successful poll */
  const knownRequestIds    = useRef(new Set());
  /** Ids the user dismissed via × in this session */
  const dismissedRequestIds = useRef(new Set());
  /** True only for the very first fetch after mount */
  const isFirstLoad = useRef(true);

  const refresh = useCallback(async ({ showSpinner = false } = {}) => {
    if (!isTeacher) return;

    if (showSpinner) setLoading(true);

    try {
      const result  = await proxyService.getNotifications();
      const incoming = Array.isArray(result.data) ? result.data : [];

      setRequests(incoming);
      setUnreadCount(result.count ?? 0);

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
  }, [isTeacher]);

  /* ── Mount / unmount effect ── */
  useEffect(() => {
    if (!isTeacher) {
      setRequests([]);
      setUnreadCount(0);
      setPopupVisible(false);
      knownRequestIds.current     = new Set();
      dismissedRequestIds.current = new Set();
      isFirstLoad.current         = true;
      return undefined;
    }

    // Reset state on login
    isFirstLoad.current         = true;
    knownRequestIds.current     = new Set();
    dismissedRequestIds.current = new Set();

    refresh({ showSpinner: true });

    const intervalId = window.setInterval(() => refresh(), POLL_INTERVAL_MS);

    const handleRefreshEvent = () => refresh({ showSpinner: true });
    window.addEventListener(PROXY_NOTIFICATIONS_REFRESH_EVENT, handleRefreshEvent);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(PROXY_NOTIFICATIONS_REFRESH_EVENT, handleRefreshEvent);
    };
  }, [isTeacher, refresh]);

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
   * Marks everything as read on the backend and clears local state instantly.
   */
  const markAllRead = useCallback(async () => {
    try {
      await proxyService.markNotificationsRead();
    } catch (error) {
      console.error('Error marking proxy notifications read:', error);
    } finally {
      // Clear local state immediately regardless of API outcome
      setUnreadCount(0);
      setRequests([]);
      setPopupVisible(false);
      knownRequestIds.current = new Set();
    }
  }, []);

  return {
    requests,
    unreadCount,
    popupVisible,
    latestRequest: requests[0] ?? null,
    loading,
    dismissPopup,
    markAllRead,
    refresh,
  };
};
