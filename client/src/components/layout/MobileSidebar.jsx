// FleetHub – MobileSidebar Component (Always-Dark)
import { NavLink, useLocation } from 'react-router-dom';
import { HiOutlineXMark, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import SIDEBAR_CONFIG from '@/config/sidebarConfig';
import { getInitials } from '@/utils/helpers';

const MobileSidebar = () => {
  const { mobileOpen, closeMobileSidebar } = useSidebar();
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

  if (!mobileOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-[#090909]/80 backdrop-blur-sm lg:hidden transition-opacity animate-fade-in"
        onClick={closeMobileSidebar}
      />

      {/* Drawer */}
      <aside className="fixed top-0 left-0 z-50 h-screen w-72 bg-[#111111] text-[#A3A3A3] border-r border-[#2E2E2E] shadow-2xl lg:hidden animate-slide-in-left flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#2E2E2E] flex-shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/assets/fleethub-logo-horizontal.png"
              alt="FleetHub – Smarter Logistics"
              className="h-9 w-auto max-w-[170px] object-contain"
            />
          </div>
          <button
            onClick={closeMobileSidebar}
            className="p-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
            aria-label="Close menu"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {filteredConfig.map((group) => (
            <div key={group.id}>
              {group.title && (
                <p className="px-3 mb-1.5 text-2xs font-semibold uppercase tracking-wider text-slate-500">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={closeMobileSidebar}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200 ease-out relative
                        ${active
                          ? 'bg-amber-500 text-black font-bold shadow-sm'
                          : 'text-[#A3A3A3] hover:bg-[#242424] hover:text-white'
                        }
                      `}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r bg-black" />
                      )}
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        active ? 'text-black' : 'text-[#A3A3A3] group-hover:text-amber-400'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Profile & Status Section */}
        <div className="flex-shrink-0 p-3 border-t border-[#2E2E2E] space-y-2">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse-soft" />
              <span className="font-medium text-slate-300">FastFleet Online</span>
            </div>
            <span className="text-2xs text-[#A3A3A3] font-mono">v2.0</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E]/60">
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
              onClick={() => { closeMobileSidebar(); logout(); }}
              title="Logout"
              className="p-1.5 rounded-md text-[#A3A3A3] hover:text-red-400 hover:bg-[#2E2E2E] transition-colors"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
