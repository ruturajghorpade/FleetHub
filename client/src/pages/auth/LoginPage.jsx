// FleetHub – Login Page (Enterprise Authentication)
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@fleethub.in');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock login — always succeeds in demo
    login({ email, password });
    setTimeout(() => {
      setLoading(false);
      navigate(from, { replace: true });
    }, 600);
  };

  return (
    <div className="card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sign in to your FleetHub management portal
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
              placeholder="admin@fleethub.in"
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
            <span className="text-xs text-primary-600 dark:text-secondary-400 hover:underline cursor-pointer">
              Forgot password?
            </span>
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
          className="w-full py-2.5"
          loading={loading}
        >
          Sign in to Dashboard
        </Button>
      </form>

      {/* Demo notice */}
      <div className="mt-6 p-3 rounded-lg bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200/60 dark:border-primary-800/40">
        <p className="text-xs text-primary-800 dark:text-primary-300 text-center">
          <span className="font-semibold">Demo Sandbox:</span> Click "Sign in to Dashboard" to log in with prefilled credentials
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
