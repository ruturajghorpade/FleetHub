// FleetHub – Header / Navbar Component
import { HiOutlineBars3, HiOutlineBell, HiOutlineMoon, HiOutlineSun, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';
import { getInitials } from '@/utils/helpers';

const Header = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { darkMode, toggleTheme } = useTheme();

  // Placeholder user — will be replaced by AuthContext in Phase 3+
  const user = { name: 'Admin User', role: 'Super Admin' };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-dark-700/60">
      {/* Left: Menu toggle + Search */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-dark-500 hover:bg-gray-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors"
          aria-label="Toggle mobile menu"
        >
          <HiOutlineBars3 className="w-5 h-5" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-2 rounded-xl text-dark-500 hover:bg-gray-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <HiOutlineBars3 className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-dark-800 min-w-[280px]">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-transparent text-sm text-dark-700 dark:text-dark-200 placeholder:text-dark-400 outline-none"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-dark-500 hover:bg-gray-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <HiOutlineSun className="w-5 h-5" />
          ) : (
            <HiOutlineMoon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl text-dark-500 hover:bg-gray-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors"
          aria-label="Notifications"
        >
          <HiOutlineBell className="w-5 h-5" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-900" />
        </button>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-dark-700 mx-1" />

        {/* User avatar */}
        <div className="flex items-center gap-3 pl-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {getInitials(user.name)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-dark-800 dark:text-dark-100 leading-tight">
              {user.name}
            </p>
            <p className="text-2xs text-dark-400 dark:text-dark-500 leading-tight">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
