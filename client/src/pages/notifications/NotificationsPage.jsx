// FleetHub – Notifications & Real-Time Operational Alerts Page
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import notificationService from '@/services/notificationService';
import { showError, showSuccess } from '@/utils/toastUtils';
import { formatRelativeTime } from '@/utils/formatters';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      showError(err.message || 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      showSuccess('Marked notification as read');
    } catch (err) {
      showError(err.message || 'Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showSuccess('All notifications marked as read');
    } catch (err) {
      showError(err.message || 'Failed to mark all as read');
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'unread') return !n.isRead;
      if (activeTab === 'assignments') return n.type === 'ASSIGNMENT';
      if (activeTab === 'alerts') return n.type === 'CANCELLATION' || n.type === 'ALERT';
      return true;
    });
  }, [notifications, activeTab]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ASSIGNMENT':
        return (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <HiOutlineTruck className="w-5 h-5" />
          </div>
        );
      case 'CANCELLATION':
        return (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <HiOutlineXCircle className="w-5 h-5" />
          </div>
        );
      case 'ALERT':
        return (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <HiOutlineExclamationTriangle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <HiOutlineInformationCircle className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Notifications & Alerts"
        subtitle="Real-time delivery assignments, rider cancellations, vehicle maintenance reminders, and system events."
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              leftIcon={<HiOutlineCheck className="w-4 h-4" />}
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read ({unreadCount})
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2E2E2E] pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-amber-500 text-black font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'unread'
              ? 'bg-amber-500 text-black font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'assignments'
              ? 'bg-amber-500 text-black font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          Assignments
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'bg-amber-500 text-black font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          Alerts & Cancellations
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-[#A3A3A3]">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="py-16 text-center text-[#A3A3A3]">
            <HiOutlineBell className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-base font-medium text-white">No notifications to display</p>
            <p className="text-xs text-[#A3A3A3] mt-1">
              You're all caught up! New dispatch alerts and updates will appear here.
            </p>
          </Card>
        ) : (
          filteredNotifications.map((n) => (
            <Card
              key={n._id}
              className={`p-4 transition-all hover:border-[#3E3E3E] ${
                n.isRead ? 'bg-[#111111]/80 opacity-75' : 'bg-[#141414] border-amber-500/30 shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                {getTypeIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs text-[#A3A3A3] whitespace-nowrap">
                      {formatRelativeTime ? formatRelativeTime(n.createdAt) : new Date(n.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-amber-400 hover:bg-[#242424] transition-colors"
                  >
                    <HiOutlineCheckCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
