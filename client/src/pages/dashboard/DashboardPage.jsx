// FleetHub – Dynamic Role-Based Dashboard Page
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/layout/PageHeader';
import AdminDashboard from './components/AdminDashboard';
import DispatcherDashboard from './components/DispatcherDashboard';
import ClientDashboard from './components/ClientDashboard';
import DriverDashboard from './components/DriverDashboard';

const DashboardPage = () => {
  const { user, activeRole, switchRole } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleSubtitle = () => {
    switch (activeRole) {
      case 'client_admin':
        return `Managing delivery logistics for ${user?.client?.name || "Domino's Pizza"}.`;
      case 'dispatcher':
        return 'Monitoring live pending orders, rider availability, and auto-dispatch.';
      case 'driver':
        return 'View your assigned food deliveries, pickup addresses, and trip actions.';
      default:
        return "FastFleet Logistics — Food Delivery Fleet Operations Overview.";
    }
  };

  const roleTabs = [
    { id: 'super_admin', label: '👑 Super Admin', desc: 'FastFleet HQ' },
    { id: 'client_admin', label: "🍕 Client (Domino's)", desc: 'Restaurant Store' },
    { id: 'dispatcher', label: '📻 Dispatcher', desc: 'Central Dispatch' },
    { id: 'driver', label: '🛵 Driver Partner', desc: 'Rajesh (Ather EV)' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Top Banner & Fast Role Switcher Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={`${greeting()}, ${user?.name?.split(' ')[0] || 'User'}`}
          subtitle={getRoleSubtitle()}
          className="mb-0"
        />

        {/* Interactive Role Switcher Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 shadow-inner flex-wrap">
          {roleTabs.map((tab) => {
            const isActive = activeRole === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchRole(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-secondary-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Role-Specific Dashboard View */}
      {activeRole === 'client_admin' && <ClientDashboard />}
      {activeRole === 'dispatcher' && <DispatcherDashboard />}
      {activeRole === 'driver' && <DriverDashboard />}
      {activeRole === 'super_admin' && <AdminDashboard />}
    </div>
  );
};

export default DashboardPage;
