import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Bell, CheckCheck } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  createdAt: string;
  timeAgo: string;
  category: string;
  linkPath?: string;
  unread?: boolean;
}

// Relative time helper
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.max(1, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch live notifications from backend
  const fetchLiveNotifications = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const token = localStorage.getItem('crm_token');
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const formatted: NotificationItem[] = data.map((item: any) => ({
          ...item,
          timeAgo: formatTimeAgo(item.createdAt),
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error('Failed to poll notifications:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and 10-second polling interval
  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(() => {
      fetchLiveNotifications(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchLiveNotifications]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchLiveNotifications(false);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="font-['Onest'] text-[#050720] pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-['Sora'] text-[#050720]">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFB908] text-[#050720] rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-[#050720]/60 mt-1">
            Stay updated on tasks, demos, and system activity (live synced)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#050720]/15 hover:bg-[#050720]/5 rounded-lg text-xs font-semibold text-[#050720]/70 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#050720]/15 hover:bg-[#050720]/5 rounded-lg text-xs font-semibold text-[#050720]/70 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FFB908]' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#050720]/40">
            Checking for updates...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-[#050720]/10 rounded-xl p-12 text-center shadow-xs space-y-2">
            <Bell className="w-8 h-8 mx-auto text-[#050720]/20" />
            <p className="text-xs font-semibold text-[#050720]/60">All caught up!</p>
            <p className="text-[11px] text-[#050720]/40">
              No new alerts or pending tasks requiring attention.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.linkPath) navigate(item.linkPath);
              }}
              className={`bg-white border rounded-xl px-6 py-4 flex items-center justify-between shadow-xs hover:border-[#FFB908] transition-all cursor-pointer relative overflow-hidden ${
                item.unread ? 'border-[#FFB908]/50 bg-amber-50/10' : 'border-[#050720]/10'
              }`}
            >
              {item.unread && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFB908]" />
              )}
              <div className="pr-4">
                <p className="text-xs font-medium text-[#050720]">{item.title}</p>
                <span className="text-[10px] text-[#050720]/40 block mt-1">{item.timeAgo}</span>
              </div>

              <span className="text-xs font-medium text-[#0066FF] hover:underline whitespace-nowrap shrink-0">
                {item.category}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};