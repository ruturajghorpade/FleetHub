// FleetHub – Header / Navbar Component (with Food Logistics Role Switcher)
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
} from 'react-icons/hi2';
import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/helpers';
import Dropdown from '@/components/common/Dropdown';

const Header = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { mode, toggleTheme } = useTheme();
  const { user, activeRole, switchRole, logout } = useAuth();

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
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Left: Menu toggle + Search */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <HiOutlineBars3 className="w-5 h-5" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <HiOutlineBars3 className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 min-w-[280px] transition-all focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search orders, riders, restaurants..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Right: Actions & Role Switcher */}
      <div className="flex items-center gap-2">
        {/* Fast Role Switcher */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Role:</span>
          <select
            value={activeRole}
            onChange={(e) => switchRole(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer text-xs"
            aria-label="Switch Role"
          >
            <option value="super_admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              👑 Super Admin
            </option>
            <option value="client_admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              🍕 Client (Domino's)
            </option>
            <option value="dispatcher" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              📻 Dispatcher
            </option>
            <option value="driver" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              🛵 Driver Partner
            </option>
          </select>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={`Theme: ${themeLabel()}`}
          title={`Theme: ${themeLabel()}`}
        >
          {themeIcon()}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <HiOutlineBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* User dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2.5 pl-1 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 transition-colors">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #0F6B7A, #14B8A6)' }}
              >
                {getInitials(user?.name || 'U')}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-2xs text-slate-400 leading-tight">
                  {user?.roleTitle || user?.organization || 'FastFleet'}
                </p>
              </div>
            </div>
          }
          align="right"
        >
          {({ close }) => (
            <>
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {user?.name}
                </p>
                <p className="text-xs text-primary-600 dark:text-secondary-400 font-medium">
                  {user?.roleTitle}
                </p>
                <p className="text-2xs text-slate-400 mt-0.5">
                  {user?.organization}
                </p>
              </div>

              <Dropdown.Item icon={HiOutlineUserCircle} onClick={() => close()}>
                Profile
              </Dropdown.Item>
              <Dropdown.Item icon={HiOutlineCog6Tooth} onClick={() => close()}>
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
