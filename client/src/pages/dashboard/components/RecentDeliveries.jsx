// FleetHub – Recent Deliveries Component (Enterprise SaaS Table)
import { MOCK_DELIVERIES } from '@/data/mockData';
import StatusBadge from '@/components/common/StatusBadge';
import Card from '@/components/common/Card';
import { HiOutlineArrowRight } from 'react-icons/hi2';

const RecentDeliveries = () => {
  return (
    <Card className="overflow-hidden" padding="p-0">
      <Card.Header className="px-5 pt-5 pb-3">
        <div>
          <Card.Title>Recent Deliveries</Card.Title>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active assignments and recent shipments</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors">
          View all
          <HiOutlineArrowRight className="w-3.5 h-3.5" />
        </button>
      </Card.Header>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-y border-slate-200 dark:border-[#2E2E2E] bg-slate-50/80 dark:bg-[#1A1A1A]">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tracking ID
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                Route
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell">
                Driver
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                Client
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
            {MOCK_DELIVERIES.map((delivery) => (
              <tr
                key={delivery._id}
                className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60 transition-colors cursor-pointer group"
              >
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs group-hover:text-amber-500 transition-colors">
                    {delivery.trackingId}
                  </span>
                </td>
                <td className="px-5 py-3.5 hidden sm:table-cell">
                  <div className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                    <span>{delivery.origin}</span>
                    <span className="text-slate-400 dark:text-slate-600 mx-1.5">→</span>
                    <span>{delivery.destination}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell text-slate-700 dark:text-slate-300 text-xs">
                  {delivery.driver || <span className="text-slate-400">Unassigned</span>}
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 dark:text-slate-400 text-xs">
                  {delivery.client}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={delivery.status} type="delivery" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentDeliveries;
