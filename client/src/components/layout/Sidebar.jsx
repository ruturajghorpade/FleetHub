// FleetHub – Sidebar Component
import { NavLink, useLocation } from 'react-router-dom';
import { HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight } from 'react-icons/hi2';
import { useSidebar } from '@/context/SidebarContext';
import SIDEBAR_ITEMS from '@/config/sidebarConfig';

const Sidebar = () => {
  const { collapsed, mobileOpen, toggleSidebar, closeMobileSidebar } = useSidebar();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const sidebarClasses = `
    fixed top-0 left-0 z-40 h-screen flex flex-col
    bg-white dark:bg-dark-900
    border-r border-gray-200/60 dark:border-dark-700/60
    transition-all duration-300 ease-in-out
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0
    ${collapsed ? 'lg:w-20' : 'lg:w-64'}
    w-64
    shadow-sidebar
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Logo area */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/60 dark:border-dark-700/60 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo icon */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          {/* Logo text */}
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-dark-900 dark:text-white tracking-tight">
                Fleet<span className="text-primary-600">Hub</span>
              </h1>
              <p className="text-2xs text-dark-400 dark:text-dark-500 -mt-0.5">Fleet Management</p>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-1.5 rounded-lg text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
          aria-label="Collapse sidebar"
        >
          {collapsed ? (
            <HiOutlineChevronDoubleRight className="w-4 h-4" />
          ) : (
            <HiOutlineChevronDoubleLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={closeMobileSidebar}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 ease-out
                ${active
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400 shadow-sm'
                  : 'text-dark-500 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-dark-800 dark:hover:text-dark-200'
                }
                ${collapsed ? 'lg:justify-center lg:px-0' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-dark-400 group-hover:text-dark-600 dark:group-hover:text-dark-300'
              }`} />
              {!collapsed && (
                <span className="truncate animate-fade-in">{item.label}</span>
              )}
              {/* Active indicator */}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse-soft" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200/60 dark:border-dark-700/60">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-500/5 dark:to-secondary-500/5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" />
            <span className="text-xs font-medium text-dark-600 dark:text-dark-300">
              System Online
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft" title="System Online" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
