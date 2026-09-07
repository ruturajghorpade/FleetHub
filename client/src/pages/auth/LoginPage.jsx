// FleetHub – Login Page (Enterprise Authentication)
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLE_ACCOUNTS } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@fastfleet.in');
  const [password, setPassword] = useState('Password@123');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login({ email, password });
    setSubmitting(false);

    if (result?.success) {
      navigate(from, { replace: true });
    }
  };

  const fillCredentials = (roleKey) => {
    const acc = ROLE_ACCOUNTS[roleKey];
    if (acc) {
      setEmail(acc.email);
      setPassword(acc.password);
    }
  };

  return (
    <div className="card p-8 rounded-2xl border border-[#E5E5E5] dark:border-[#2E2E2E] shadow-card bg-white dark:bg-[#111111]">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-[#FAFAFA] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#A3A3A3]">
          Sign in to your FleetHub operations portal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-9"
              placeholder="admin@fastfleet.in"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
          </div>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-9"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-bold"
          loading={submitting}
        >
          Sign in to Dashboard
        </Button>
      </form>

      {/* Quick Role Fill Buttons */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#2E2E2E]">
        <p className="text-xs font-semibold text-slate-500 dark:text-[#A3A3A3] mb-2.5 text-center">
          Quick Demo Accounts (Click to Fill):
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillCredentials('super_admin')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-[#1A1A1A] hover:bg-amber-500/10 hover:text-amber-500 text-left border border-slate-200 dark:border-[#2E2E2E] transition-colors"
          >
            <p className="font-bold">Super Admin</p>
            <p className="text-[10px] text-slate-500 truncate">admin@fastfleet.in</p>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('client_admin')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-[#1A1A1A] hover:bg-amber-500/10 hover:text-amber-500 text-left border border-slate-200 dark:border-[#2E2E2E] transition-colors"
          >
            <p className="font-bold">Domino's Store</p>
            <p className="text-[10px] text-slate-500 truncate">manager@dominos.in</p>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('dispatcher')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-[#1A1A1A] hover:bg-amber-500/10 hover:text-amber-500 text-left border border-slate-200 dark:border-[#2E2E2E] transition-colors"
          >
            <p className="font-bold">Dispatcher</p>
            <p className="text-[10px] text-slate-500 truncate">dispatch@fastfleet.in</p>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('driver')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-[#1A1A1A] hover:bg-amber-500/10 hover:text-amber-500 text-left border border-slate-200 dark:border-[#2E2E2E] transition-colors"
          >
            <p className="font-bold">EV Rider</p>
            <p className="text-[10px] text-slate-500 truncate">rajesh.rider@fastfleet.in</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
