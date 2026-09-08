import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HiOutlineBars3,
  HiOutlineBell,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineComputerDesktop,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUserCircle,
  HiOutlineCog6Tooth,
  HiOutlineCheck,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import ROUTES from '@/config/routeConfig';
import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/helpers';
import { formatRelativeTime } from '@/utils/formatters';
import Dropdown from '@/components/common/Dropdown';
import notificationService from '@/services/notificationService';

const Header = () => {
  const navigate = useNavigate();
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { mode, toggleTheme } = useTheme();
  const { user, activeRole, switchRole, logout } = useAuth();

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  // Fetch unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch {
      // ignore in header background fetch
    }
  }, []);

  // Fetch latest notifications for dropdown
  const loadRecentNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await notificationService.getNotifications({ limit: 5 });
      setRecentNotifications(res.notifications || []);
      if (typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // ignore
    } finally {
      setNotifLoading(false);
    }
  }, []);

  // Poll unread count on mount and interval
  useEffect(() => {
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [refreshUnreadCount, user]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const toggleNotifDropdown = () => {
    const nextState = !notifOpen;
    setNotifOpen(nextState);
    if (nextState) {
      loadRecentNotifications();
    }
  };

  const handleHeaderMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleHeaderMarkSingleRead = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setRecentNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const handleItemClick = (n) => {
    setNotifOpen(false);
    if (!n.isRead && !n.read) {
      notificationService.markAsRead(n._id).catch(() => {});
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    const deliveryId = n.delivery?._id || n.delivery || (n.relatedEntity === 'Delivery' ? n.relatedEntityId : null);
    if (deliveryId) {
      navigate(`/deliveries/${deliveryId}`);
    } else {
      navigate(ROUTES.NOTIFICATIONS);
    }
  };

  const getHeaderTypeIcon = (type) => {
    switch (type) {
      case 'DELIVERY_ASSIGNED':
      case 'ASSIGNMENT':
      case 'DRIVER_ASSIGNMENT':
        return (
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex-shrink-0">
            <HiOutlineTruck className="w-4 h-4" />
          </div>
        );
      case 'DELIVERY_CANCELLED':
      case 'CANCELLATION':
        return (
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex-shrink-0">
            <HiOutlineXCircle className="w-4 h-4" />
          </div>
        );
      case 'DELIVERY_DELIVERED':
        return (
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
            <HiOutlineCheckCircle className="w-4 h-4" />
          </div>
        );
      case 'MAINTENANCE_ALERT':
      case 'ALERT':
        return (
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex-shrink-0">
            <HiOutlineExclamationTriangle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex-shrink-0">
            <HiOutlineInformationCircle className="w-4 h-4" />
          </div>
        );
    }
  };

  const themeIcon = () => {
    if (mode === 'dark') return <HiOutlineMoon className="w-5 h-5" />;
    if (mode === 'system') return <HiOutlineComputerDesktop className="w-5 h-5" />;
    return <HiOutlineSun className="w-5 h-5" />;
  };

  const themeLabel = () => {
    if (mode === 'dark') return 'Dark';
    if (mode === 'system') return 'System';
    return 'Light';
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-[#111111] border-b border-[#2E2E2E] text-white">
      {/* Left: Menu toggle + Search */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
          aria-label="Toggle mobile menu"
        >
          <HiOutlineBars3 className="w-5 h-5" />
        </button>

        {/* Mobile logo mark */}
        <div className="flex items-center gap-2 lg:hidden">
          <img
            src="/assets/fleethub-logo-mark.png"
            alt="FleetHub"
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold text-sm tracking-tight text-white hidden xs:inline">
            Fleet<span className="text-amber-500">Hub</span>
          </span>
        </div>

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
          aria-label="Toggle sidebar"
        >
          <HiOutlineBars3 className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] min-w-[280px] transition-all focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-[#A3A3A3] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search orders, riders, restaurants..."
            className="w-full bg-transparent text-sm text-[#FAFAFA] placeholder:text-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Right: Actions & Role Switcher */}
      <div className="flex items-center gap-2">
        {/* Fast Role Switcher */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] text-xs">
          <span className="text-[#A3A3A3] font-medium hidden sm:inline">Role:</span>
          <select
            value={activeRole}
            onChange={(e) => switchRole(e.target.value)}
            className="bg-transparent font-semibold text-amber-400 outline-none cursor-pointer text-xs"
            aria-label="Switch Role"
          >
            <option value="super_admin" className="bg-[#111111] text-slate-200">
              👑 Super Admin
            </option>
            <option value="client_admin" className="bg-[#111111] text-slate-200">
              🍕 Client (Domino's)
            </option>
            <option value="dispatcher" className="bg-[#111111] text-slate-200">
              📻 Dispatcher
            </option>
            <option value="driver" className="bg-[#111111] text-slate-200">
              🛵 Driver Partner
            </option>
          </select>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
          aria-label={`Theme: ${themeLabel()}`}
          title={`Theme: ${themeLabel()}`}
        >
          {themeIcon()}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotifDropdown}
            className="relative p-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
            aria-label="Notifications"
            title="Notifications & Alerts"
          >
            <HiOutlineBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-amber-500 text-black font-extrabold text-[10px] leading-tight flex items-center justify-center rounded-full ring-2 ring-[#111111] animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141414] border border-[#2E2E2E] rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#242424] bg-[#171717]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-2xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleHeaderMarkAllRead}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium hover:underline flex items-center gap-1 transition-colors"
                  >
                    <HiOutlineCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#222222]">
                {notifLoading ? (
                  <div className="py-8 text-center text-[#A3A3A3]">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs">Loading updates...</span>
                  </div>
                ) : recentNotifications.length === 0 ? (
                  <div className="py-8 text-center px-4">
                    <HiOutlineBell className="w-8 h-8 mx-auto mb-2 text-[#555555]" />
                    <p className="text-xs font-semibold text-[#A3A3A3]">No new notifications</p>
                    <p className="text-2xs text-[#777777] mt-0.5">You're all caught up with delivery alerts!</p>
                  </div>
                ) : (
                  recentNotifications.map((n) => {
                    const isUnread = !n.isRead && !n.read;
                    return (
                      <div
                        key={n._id}
                        onClick={() => handleItemClick(n)}
                        className={`p-3 transition-colors cursor-pointer flex items-start gap-3 hover:bg-[#1C1C1C] ${
                          isUnread ? 'bg-amber-500/[0.04]' : 'opacity-80'
                        }`}
                      >
                        {getHeaderTypeIcon(n.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className={`text-xs font-medium truncate ${isUnread ? 'text-white font-semibold' : 'text-slate-300'}`}>
                              {n.title}
                            </h4>
                            <span className="text-2xs text-[#737373] whitespace-nowrap flex-shrink-0">
                              {formatRelativeTime ? formatRelativeTime(n.createdAt) : ''}
                            </span>
                          </div>
                          <p className="text-2xs text-[#A3A3A3] line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                        {isUnread && (
                          <button
                            onClick={(e) => handleHeaderMarkSingleRead(e, n._id)}
                            title="Mark as read"
                            className="p-1 rounded text-[#737373] hover:text-amber-400 hover:bg-[#2A2A2A] transition-colors flex-shrink-0"
                          >
                            <HiOutlineCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-[#242424] bg-[#171717] text-center">
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    navigate(ROUTES.NOTIFICATIONS);
                  }}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-amber-400 hover:text-black hover:bg-amber-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View All Notifications</span>
                  <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-[#2E2E2E] mx-1" />

        {/* User dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2.5 pl-1 cursor-pointer rounded-lg hover:bg-[#242424] p-1.5 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-black text-xs font-bold flex-shrink-0 shadow-sm bg-amber-500">
                {getInitials(user?.name || 'U')}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-2xs text-[#A3A3A3] leading-tight">
                  {user?.roleTitle || user?.organization || 'FastFleet'}
                </p>
              </div>
            </div>
          }
          align="right"
        >
          {({ close }) => (
            <>
              <div className="px-4 py-3 border-b border-[#2E2E2E]">
                <p className="text-sm font-semibold text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-amber-500 font-medium">
                  {user?.roleTitle}
                </p>
                <p className="text-2xs text-[#A3A3A3] mt-0.5">
                  {user?.organization}
                </p>
              </div>

              <Dropdown.Item icon={HiOutlineUserCircle} onClick={() => { close(); navigate(ROUTES.SETTINGS); }}>
                Profile
              </Dropdown.Item>
              <Dropdown.Item icon={HiOutlineCog6Tooth} onClick={() => { close(); navigate(ROUTES.SETTINGS); }}>
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item icon={HiOutlineArrowRightOnRectangle} danger onClick={() => { close(); logout(); }}>
                Logout
              </Dropdown.Item>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
