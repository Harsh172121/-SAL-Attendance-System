/**
 * Polls the direct-to-faculty proxy notification feed.
 *
 * The backend tracks unread requests with `proxyFacultyViewedAt`, so the
 * badge survives refreshes and multi-tab use. The popup only animates in when
 * a genuinely new request id appears, not on every poll.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { proxyService } from '../services/dataService';

export const PROXY_NOTIFICATIONS_REFRESH_EVENT = 'sal:proxy-notifications-refresh';
const POLL_INTERVAL_MS = 20000;

export const useProxyNotifications = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [requests, setRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const knownRequestIds = useRef(new Set());
  const dismissedRequestIds = useRef(new Set());
  const isFirstLoad = useRef(true);

  const refresh = useCallback(async ({ showSpinner = false } = {}) => {
    if (!isTeacher) return;

    if (showSpinner) setLoading(true);

    try {
      const result = await proxyService.getNotifications();
      const incoming = Array.isArray(result.data) ? result.data : [];

      setRequests(incoming);
      setUnreadCount(result.count || 0);

      const currentIds = new Set(incoming.map((request) => request.id));
      const hasNewRequest = incoming.some(
        (request) =>
          !knownRequestIds.current.has(request.id) &&
          !dismissedRequestIds.current.has(request.id)
      );

      if (hasNewRequest || (isFirstLoad.current && currentIds.size > 0)) {
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

  useEffect(() => {
    if (!isTeacher) {
      setRequests([]);
      setUnreadCount(0);
      setPopupVisible(false);
      knownRequestIds.current = new Set();
      dismissedRequestIds.current = new Set();
      isFirstLoad.current = true;
      return undefined;
    }

    isFirstLoad.current = true;
    knownRequestIds.current = new Set();
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

  const dismissPopup = useCallback(() => {
    requests.forEach((request) => dismissedRequestIds.current.add(request.id));
    setPopupVisible(false);
  }, [requests]);

  const markAllRead = useCallback(async () => {
    try {
      await proxyService.markNotificationsRead();
      setUnreadCount(0);
      setRequests([]);
      setPopupVisible(false);
      knownRequestIds.current = new Set();
    } catch (error) {
      console.error('Error marking proxy notifications read:', error);
    }
  }, []);

  return {
    requests,
    unreadCount,
    popupVisible,
    latestRequest: requests[0] || null,
    loading,
    dismissPopup,
    markAllRead,
    refresh
  };
};
