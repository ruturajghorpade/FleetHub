// FleetHub – Notifications & Real-Time Operational Alerts Page
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import notificationService from '@/services/notificationService';
import { showError, showSuccess } from '@/utils/toastUtils';
import { formatRelativeTime } from '@/utils/formatters';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
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

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
      );
      showSuccess('Marked notification as read');
    } catch (err) {
      showError(err.message || 'Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      showSuccess('All notifications marked as read');
    } catch (err) {
      showError(err.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showSuccess('Notification deleted');
    } catch (err) {
      showError(err.message || 'Failed to delete notification');
    }
  };

  const handleNotificationClick = (n) => {
    // Auto mark as read
    if (!n.isRead && !n.read) {
      notificationService.markAsRead(n._id).catch(() => {});
      setNotifications((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, isRead: true, read: true } : item))
      );
    }

    const deliveryId = n.delivery?._id || n.delivery || (n.relatedEntity === 'Delivery' ? n.relatedEntityId : null);
    if (deliveryId) {
      navigate(`/deliveries/${deliveryId}`);
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead && !n.read).length;
  }, [notifications]);

  const assignmentCount = useMemo(() => {
    return notifications.filter((n) =>
      ['ASSIGNMENT', 'DELIVERY_ASSIGNED', 'DRIVER_ASSIGNMENT', 'DELIVERY_PICKED_UP', 'DELIVERY_IN_TRANSIT', 'DELIVERY_DELIVERED'].includes(n.type)
    ).length;
  }, [notifications]);

  const alertCount = useMemo(() => {
    return notifications.filter((n) =>
      ['CANCELLATION', 'DELIVERY_CANCELLED', 'ALERT', 'MAINTENANCE_ALERT', 'SYSTEM_ALERT'].includes(n.type)
    ).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isUnread = !n.isRead && !n.read;
      if (activeTab === 'unread') return isUnread;
      if (activeTab === 'assignments') {
        return ['ASSIGNMENT', 'DELIVERY_ASSIGNED', 'DRIVER_ASSIGNMENT', 'DELIVERY_PICKED_UP', 'DELIVERY_IN_TRANSIT', 'DELIVERY_DELIVERED'].includes(n.type);
      }
      if (activeTab === 'alerts') {
        return ['CANCELLATION', 'DELIVERY_CANCELLED', 'ALERT', 'MAINTENANCE_ALERT', 'SYSTEM_ALERT'].includes(n.type);
      }
      return true;
    });
  }, [notifications, activeTab]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'DELIVERY_ASSIGNED':
      case 'ASSIGNMENT':
      case 'DRIVER_ASSIGNMENT':
        return (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <HiOutlineTruck className="w-5 h-5" />
          </div>
        );
      case 'DELIVERY_PICKED_UP':
      case 'DELIVERY_IN_TRANSIT':
        return (
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <HiOutlineTruck className="w-5 h-5" />
          </div>
        );
      case 'DELIVERY_DELIVERED':
        return (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <HiOutlineCheckCircle className="w-5 h-5" />
          </div>
        );
      case 'DELIVERY_CANCELLED':
      case 'CANCELLATION':
        return (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <HiOutlineXCircle className="w-5 h-5" />
          </div>
        );
      case 'MAINTENANCE_ALERT':
        return (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <HiOutlineWrenchScrewdriver className="w-5 h-5" />
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

  const renderEmptyState = () => {
    let title = 'No notifications to display';
    let subtitle = "You're all caught up! New dispatch alerts and updates will appear here.";

    if (activeTab === 'unread') {
      title = 'All Caught Up!';
      subtitle = 'You have zero unread notifications. All delivery updates have been acknowledged.';
    } else if (activeTab === 'assignments') {
      title = 'No Assignment Alerts';
      subtitle = 'When deliveries are dispatched or drivers are assigned to orders, they will show here.';
    } else if (activeTab === 'alerts') {
      title = 'No Operational Alerts';
      subtitle = 'No cancellations or vehicle maintenance warnings found. Fleet operations are running smoothly!';
    }

    return (
      <Card className="py-16 text-center text-[#A3A3A3] bg-[#111111] border-[#262626]">
        <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center mx-auto mb-3 text-amber-400">
          <HiOutlineBell className="w-7 h-7" />
        </div>
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="text-xs text-[#A3A3A3] mt-1 max-w-md mx-auto">
          {subtitle}
        </p>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Notifications & Alerts"
        subtitle="Real-time delivery assignments, rider cancellations, vehicle maintenance reminders, and multi-tenant events."
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
      <div className="flex items-center gap-2 border-b border-[#2E2E2E] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-amber-500 text-black font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          <span>All</span>
          <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-black/20 text-black' : 'bg-[#222222] text-[#A3A3A3]'}`}>
            {notifications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'unread'
              ? 'bg-amber-500 text-black font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className={`text-xs font-bold px-1.5 py-0.2 rounded-full ${activeTab === 'unread' ? 'bg-black text-amber-400' : 'bg-amber-500 text-black'}`}>
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'assignments'
              ? 'bg-amber-500 text-black font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          <span>Assignments</span>
          <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'assignments' ? 'bg-black/20 text-black' : 'bg-[#222222] text-[#A3A3A3]'}`}>
            {assignmentCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'bg-amber-500 text-black font-bold'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
          }`}
        >
          <span>Alerts & Exceptions</span>
          <span className={`text-xs px-1.5 py-0.2 rounded-full ${activeTab === 'alerts' ? 'bg-black/20 text-black' : 'bg-[#222222] text-[#A3A3A3]'}`}>
            {alertCount}
          </span>
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
          renderEmptyState()
        ) : (
          filteredNotifications.map((n) => {
            const isUnread = !n.isRead && !n.read;
            const hasDelivery = !!(n.delivery || (n.relatedEntity === 'Delivery' && n.relatedEntityId));

            return (
              <Card
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 transition-all cursor-pointer hover:border-[#3E3E3E] group ${
                  isUnread
                    ? 'bg-[#141414] border-amber-500/40 shadow-md ring-1 ring-amber-500/10'
                    : 'bg-[#111111]/80 border-[#222222] opacity-80'
                }`}
              >
                <div className="flex items-start gap-4">
                  {getTypeIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-semibold truncate ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                          {n.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        {hasDelivery && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded bg-[#1F1F1F] text-amber-400 border border-[#2E2E2E]">
                            <span>Delivery Details</span>
                            <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                          </span>
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

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isUnread && (
                      <button
                        onClick={(e) => handleMarkAsRead(e, n._id)}
                        title="Mark as read"
                        className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-amber-400 hover:bg-[#242424] transition-colors"
                      >
                        <HiOutlineCheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      title="Delete notification"
                      className="p-1.5 rounded-lg text-[#737373] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
