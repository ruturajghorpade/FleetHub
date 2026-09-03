// FleetHub – Sidebar Component (Always-Dark, Enterprise SaaS Layout)
import { NavLink, useLocation } from 'react-router-dom';
import {
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import SIDEBAR_CONFIG from '@/config/sidebarConfig';
import Tooltip from '@/components/common/Tooltip';
import { getInitials } from '@/utils/helpers';

const Sidebar = () => {
  const { collapsed, toggleSidebar, closeMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Filter sidebar groups and items based on active role permissions
  const filteredConfig = SIDEBAR_CONFIG.map((group) => {
    const items = group.items.filter((item) => {
      if (user?.role === 'driver') {
        return ['dashboard', 'deliveries', 'notifications'].includes(item.id);
      }
      if (user?.role === 'client_admin') {
        return ['dashboard', 'deliveries', 'reports', 'notifications', 'settings'].includes(item.id);
      }
      if (user?.role === 'dispatcher') {
        return ['dashboard', 'deliveries', 'routes', 'vehicles', 'drivers', 'notifications'].includes(item.id);
      }
      return true;
    });
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen flex-col
        bg-slate-900 text-slate-300
        border-r border-slate-800
        transition-all duration-300 ease-in-out
        shadow-sidebar
        hidden lg:flex
        ${collapsed ? 'lg:w-20' : 'lg:w-64'}
      `}
    >
      {/* Logo area */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0F6B7A, #14B8A6)' }}
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
                Fleet<span className="text-secondary-400">Hub</span>
              </h1>
              <p className="text-2xs text-slate-400 font-medium tracking-wide">Food Logistics</p>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <HiOutlineChevronDoubleRight className="w-4 h-4" />
          ) : (
            <HiOutlineChevronDoubleLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation – Grouped & Role Filtered */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {filteredConfig.map((group) => (
          <div key={group.id}>
            {group.title && !collapsed && (
              <p className="px-3 mb-1.5 text-2xs font-semibold uppercase tracking-wider text-slate-500 animate-fade-in">
                {group.title}
              </p>
            )}
            {group.title && collapsed && (
              <div className="mx-auto mb-2 w-6 border-t border-slate-800" />
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                const linkContent = (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={`
                      group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200 ease-out relative
                      ${active
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }
                      ${collapsed ? 'lg:justify-center lg:px-0' : ''}
                    `}
                  >
                    {/* Left active teal indicator line */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-secondary-400 rounded-r-full" />
                    )}

                    <Icon
                      className={`
                        w-5 h-5 flex-shrink-0 transition-colors duration-200
                        ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}
                      `}
                    />

                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </NavLink>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.id} content={item.label} position="right">
                      {linkContent}
                    </Tooltip>
                  );
                }

                return <div key={item.id}>{linkContent}</div>;
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile & Status Section */}
      <div className="flex-shrink-0 p-3 border-t border-slate-800 space-y-2">
        {!collapsed ? (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary-400 animate-pulse-soft" />
              <span className="font-medium text-slate-300">FastFleet Online</span>
            </div>
            <span className="text-2xs text-slate-500 font-mono">v2.0</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip content="FastFleet Online · v2.0" position="right">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary-400 animate-pulse-soft" />
            </Tooltip>
          </div>
        )}

        {/* User profile snippet */}
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #0F6B7A, #14B8A6)' }}
              >
                {getInitials(user?.name || 'U')}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-2xs text-slate-400 truncate leading-tight">
                  {user?.roleTitle || user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip content={`${user?.name || 'User'} · Logout`} position="right">
              <button
                onClick={logout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
