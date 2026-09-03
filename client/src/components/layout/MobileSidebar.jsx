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

  if (!mobileOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity animate-fade-in"
        onClick={closeMobileSidebar}
      />

      {/* Drawer */}
      <aside className="fixed top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-slate-300 border-r border-slate-800 shadow-2xl lg:hidden animate-slide-in-left flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #0F6B7A, #14B8A6)' }}
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
                Fleet<span className="text-secondary-400">Hub</span>
              </h1>
              <p className="text-2xs text-slate-400 font-medium">Enterprise Fleet</p>
            </div>
          </div>
          <button
            onClick={closeMobileSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {SIDEBAR_CONFIG.map((group) => (
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
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-secondary-400" />
                      )}
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        active ? 'text-white' : 'text-slate-400 group-hover:text-white'
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
        <div className="flex-shrink-0 p-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary-400 animate-pulse-soft" />
              <span className="font-medium text-slate-300">System Online</span>
            </div>
            <span className="text-2xs text-slate-500 font-mono">v1.0</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
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
                  {user?.email || 'admin@fleethub.in'}
                </p>
              </div>
            </div>
            <button
              onClick={() => { closeMobileSidebar(); logout(); }}
              title="Logout"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
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
