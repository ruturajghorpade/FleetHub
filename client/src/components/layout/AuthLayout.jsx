// FleetHub – Auth Layout (Login, Forgot Password, etc.)
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-[#090909] p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Official FleetHub Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="px-6 py-4 rounded-2xl bg-[#111111] border border-[#2E2E2E] shadow-xl flex flex-col items-center transition-transform hover:scale-105">
            <img
              src="/assets/fleethub-logo-full.png"
              alt="FleetHub – Smarter Logistics"
              className="h-20 sm:h-24 w-auto object-contain"
            />
          </div>
        </div>

        {/* Page content */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
