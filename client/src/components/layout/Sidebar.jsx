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
import { canAccessNavItem } from '@/utils/permissions';

const Sidebar = () => {
  const { collapsed, toggleSidebar, closeMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Filter sidebar groups and items based on centralized role permissions
  const filteredConfig = SIDEBAR_CONFIG.map((group) => {
    const items = group.items.filter((item) => canAccessNavItem(user?.role, item.id));
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen flex-col
        bg-[#111111] text-[#A3A3A3]
        border-r border-[#2E2E2E]
        transition-all duration-300 ease-in-out
        shadow-sidebar
        hidden lg:flex
        ${collapsed ? 'lg:w-20' : 'lg:w-64'}
      `}
    >
      {/* Logo area */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#2E2E2E] flex-shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {collapsed ? (
            <img
              src="/assets/fleethub-logo-mark.png"
              alt="FleetHub"
              className="w-10 h-10 object-contain mx-auto transition-transform hover:scale-105"
            />
          ) : (
            <div className="animate-fade-in flex items-center">
              <img
                src="/assets/fleethub-logo-horizontal.png"
                alt="FleetHub – Smarter Logistics"
                className="h-10 w-auto max-w-[178px] object-contain"
              />
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
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
              <div className="mx-auto mb-2 w-6 border-t border-[#2E2E2E]" />
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
                        ? 'bg-amber-500 text-black font-bold shadow-sm'
                        : 'text-[#A3A3A3] hover:bg-[#242424] hover:text-white'
                      }
                      ${collapsed ? 'lg:justify-center lg:px-0' : ''}
                    `}
                  >
                    {/* Left active amber indicator line */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-black rounded-r-full" />
                    )}

                    <Icon
                      className={`
                        w-5 h-5 flex-shrink-0 transition-colors duration-200
                        ${active ? 'text-black' : 'text-[#A3A3A3] group-hover:text-amber-400'}
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
      <div className="flex-shrink-0 p-3 border-t border-[#2E2E2E] space-y-2">
        {!collapsed ? (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse-soft" />
              <span className="font-medium text-slate-300">FastFleet Online</span>
            </div>
            <span className="text-2xs text-[#A3A3A3] font-mono">v2.0</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip content="FastFleet Online · v2.0" position="right">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse-soft" />
            </Tooltip>
          </div>
        )}

        {/* User profile snippet */}
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E]/60 hover:bg-[#242424] transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-black text-xs font-bold flex-shrink-0 shadow-sm bg-amber-500">
                {getInitials(user?.name || 'U')}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-2xs text-[#A3A3A3] truncate leading-tight">
                  {user?.roleTitle || user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-md text-[#A3A3A3] hover:text-red-400 hover:bg-[#2E2E2E] transition-colors"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Tooltip content={`${user?.name || 'User'} · Logout`} position="right">
              <button
                onClick={logout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A3A3A3] hover:text-red-400 hover:bg-[#242424] transition-colors"
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
