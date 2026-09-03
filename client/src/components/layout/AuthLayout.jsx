// FleetHub – Auth Layout (Login, Forgot Password, etc.)
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #0F6B7A, #14B8A6)' }}
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Fleet<span className="text-secondary-500">Hub</span>
            </h1>
            <p className="text-2xs text-slate-500 dark:text-slate-400 tracking-wider uppercase font-semibold">Enterprise Fleet</p>
          </div>
        </div>

        {/* Page content */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
