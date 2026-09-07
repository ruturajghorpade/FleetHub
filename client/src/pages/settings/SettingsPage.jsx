// FleetHub – System & Organization Settings Page
import { useState } from 'react';
import {
  HiOutlineCog6Tooth,
  HiOutlineUser,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineServerStack,
  HiOutlineCheck,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { showSuccess } from '@/utils/toastUtils';

const SettingsPage = () => {
  const { user, activeRole } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@fastfleet.in',
    phone: user?.phone || '+91 9876543210',
    organization: user?.organization || 'FastFleet Food Logistics',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    dispatchSound: true,
    slaWarnings: true,
    maintenanceReminders: true,
  });

  const [saving, setSaving] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showSuccess('Profile preferences saved successfully');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="FleetHub Settings"
        subtitle="Manage platform configuration, profile details, dispatch notification triggers, and API endpoints."
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border border-[#2E2E2E]">
            <div className="flex items-center gap-3 pb-4 border-b border-[#2E2E2E]">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <HiOutlineUser className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Profile Information</h3>
                <p className="text-xs text-[#A3A3A3]">Update your personal contact details and operational identity.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profileData.email}
                    className="w-full bg-[#161616] border border-[#262626] text-slate-400 cursor-not-allowed rounded-lg px-3 py-2 text-sm outline-none"
                  />
                  <span className="text-2xs text-slate-500 mt-1 block">Managed by FastFleet Admin</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                  Logistics Organization / Brand
                </label>
                <input
                  type="text"
                  value={profileData.organization}
                  onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  leftIcon={<HiOutlineCheck className="w-4 h-4" />}
                >
                  Save Profile
                </Button>
              </div>
            </form>
          </Card>

          {/* Notifications Preferences */}
          <Card className="p-6 border border-[#2E2E2E]">
            <div className="flex items-center gap-3 pb-4 border-b border-[#2E2E2E]">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <HiOutlineBell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Alert & Notification Triggers</h3>
                <p className="text-xs text-[#A3A3A3]">Configure how you receive dispatch updates and emergency alerts.</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between py-2 border-b border-[#242424]">
                <div>
                  <p className="text-sm font-semibold text-white">Rider Assignment Alerts</p>
                  <p className="text-xs text-[#A3A3A3]">Trigger sound chime when new orders are auto-assigned.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dispatchSound}
                  onChange={(e) => setNotifications({ ...notifications, dispatchSound: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#242424]">
                <div>
                  <p className="text-sm font-semibold text-white">30-Minute Delivery SLA Warnings</p>
                  <p className="text-xs text-[#A3A3A3]">High-priority alert when delivery approaches SLA threshold.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.slaWarnings}
                  onChange={(e) => setNotifications({ ...notifications, slaWarnings: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-white">EV Battery & Maintenance Reminders</p>
                  <p className="text-xs text-[#A3A3A3]">Receive scheduled servicing notifications for fleet vehicles.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.maintenanceReminders}
                  onChange={(e) => setNotifications({ ...notifications, maintenanceReminders: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: System Status */}
        <div className="space-y-6">
          <Card className="p-5 border border-[#2E2E2E]">
            <div className="flex items-center gap-2 pb-3 border-b border-[#2E2E2E]">
              <HiOutlineServerStack className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">System Infrastructure</h4>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#A3A3A3]">Backend API:</span>
                <span className="inline-flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE (Port 5000)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A3A3A3]">Database:</span>
                <span className="font-mono text-white">MongoDB fleethub</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A3A3A3]">API Gateway:</span>
                <span className="font-mono text-amber-400">/api/v1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A3A3A3]">Current Role:</span>
                <span className="font-mono text-amber-500 uppercase font-bold">{activeRole}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 border border-[#2E2E2E]">
            <div className="flex items-center gap-2 pb-3 border-b border-[#2E2E2E]">
              <HiOutlineShieldCheck className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Security & Auth</h4>
            </div>

            <p className="text-xs text-[#A3A3A3] mt-3 leading-relaxed">
              Session is protected via JWT Authorization headers. Tokens auto-refresh on request and expire in 7 days.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
