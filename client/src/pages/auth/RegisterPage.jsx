// FleetHub – Register Page (Enterprise Authentication)
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '@/services/authService';
import Button from '@/components/common/Button';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import { showSuccess } from '@/utils/toastUtils';
import ROUTES from '@/config/routeConfig';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setErrorMessage('Name must be at least 2 characters.');
      return false;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Work email is required.');
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please provide a valid work email address.');
      return false;
    }
    if (!formData.password) {
      setErrorMessage('Password is required.');
      return false;
    }
    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setErrorMessage('Password must contain at least one uppercase letter.');
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      setErrorMessage('Password must contain at least one lowercase letter.');
      return false;
    }
    if (!/\d/.test(formData.password)) {
      setErrorMessage('Password must contain at least one number.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await authService.register(formData);
      showSuccess('Account registered successfully! Please sign in.');
      navigate(ROUTES.LOGIN, { state: { registeredEmail: formData.email } });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        (err.request && !err.response
          ? 'Unable to connect to server. Please try again.'
          : 'Registration failed. Please check your information.');
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-8 rounded-2xl border border-[#E5E5E5] dark:border-[#2E2E2E] shadow-card bg-white dark:bg-[#111111]">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-[#FAFAFA] tracking-tight">
          Create an Account
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#A3A3A3]">
          Register as a restaurant delivery partner on FleetHub
        </p>
      </div>

      {/* Inline Error Banner */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-2.5 text-xs animate-fade-in">
          <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Full Name *
          </label>
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              id="register-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="input pl-9"
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>
        </div>

        {/* Work Email */}
        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Work Email *
          </label>
          <div className="relative">
            <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              id="register-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="input pl-9"
              placeholder="partner@restaurant.in"
              required
            />
          </div>
        </div>

        {/* Phone Number (Optional) */}
        <div>
          <label
            htmlFor="register-phone"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Phone Number <span className="text-xs text-slate-500">(Optional)</span>
          </label>
          <div className="relative">
            <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              id="register-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="input pl-9"
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Password *
          </label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              id="register-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="input pl-9"
              placeholder="Min 8 chars (uppercase, lowercase, number)"
              required
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="register-confirmPassword"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Confirm Password *
          </label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              id="register-confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input pl-9"
              placeholder="Re-enter your password"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-bold mt-2"
          loading={submitting}
          disabled={submitting}
        >
          Register Account
        </Button>
      </form>

      {/* Switch to Login Link */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[#2E2E2E] text-center text-xs">
        <span className="text-slate-500 dark:text-[#A3A3A3]">
          Already have a FleetHub account?{' '}
        </span>
        <Link
          to={ROUTES.LOGIN}
          className="font-bold text-amber-500 hover:text-amber-400 transition-colors ml-1"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
