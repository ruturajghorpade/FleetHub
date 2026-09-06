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

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#242424] transition-colors"
          aria-label="Notifications"
        >
          <HiOutlineBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-[#111111]" />
        </button>

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
