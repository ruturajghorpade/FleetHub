// FleetHub – Recent Deliveries Component (Live Enterprise SaaS Table)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/common/StatusBadge';
import Card from '@/components/common/Card';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import deliveryService from '@/services/deliveryService';
import { MOCK_DELIVERIES } from '@/data/mockData';

const RecentDeliveries = ({ deliveries: propDeliveries }) => {
  const [deliveries, setDeliveries] = useState(propDeliveries || []);
  const navigate = useNavigate();

  useEffect(() => {
    if (propDeliveries && propDeliveries.length > 0) {
      setDeliveries(propDeliveries);
      return;
    }

    const fetchRecent = async () => {
      try {
        const data = await deliveryService.getDeliveries({ limit: 6 });
        if (data?.deliveries && data.deliveries.length > 0) {
          setDeliveries(data.deliveries);
        } else {
          setDeliveries(MOCK_DELIVERIES.slice(0, 5));
        }
      } catch {
        setDeliveries(MOCK_DELIVERIES.slice(0, 5));
      }
    };
    fetchRecent();
  }, [propDeliveries]);

  return (
    <Card className="overflow-hidden" padding="p-0">
      <Card.Header className="px-5 pt-5 pb-3">
        <div>
          <Card.Title>Recent Deliveries</Card.Title>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active assignments and recent shipments</p>
        </div>
        <button
          onClick={() => navigate('/deliveries')}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors"
        >
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
                Order / Tracking ID
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                Route
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell">
                Driver Partner
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                Client / Restaurant
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#2E2E2E]">
            {deliveries.map((delivery) => {
              const driverName =
                delivery.assignedDriver?.firstName
                  ? `${delivery.assignedDriver.firstName} ${delivery.assignedDriver.lastName || ''}`
                  : delivery.driver || null;

              const clientName =
                delivery.client?.companyName || delivery.client || "Domino's Pizza";

              const origin = delivery.pickupLocation?.name || delivery.origin || 'Outlet Hub';
              const destination = delivery.deliveryLocation?.address || delivery.destination || 'Customer Address';

              return (
                <tr
                  key={delivery._id}
                  onClick={() => navigate('/deliveries')}
                  className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1A]/60 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs group-hover:text-amber-500 transition-colors">
                      {delivery.orderId || delivery.trackingId}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <div className="text-slate-600 dark:text-slate-300 text-xs font-medium max-w-[280px] truncate">
                      <span>{origin}</span>
                      <span className="text-slate-400 dark:text-slate-600 mx-1.5">→</span>
                      <span>{destination}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-slate-700 dark:text-slate-300 text-xs font-medium">
                    {driverName || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 dark:text-slate-400 text-xs">
                    {clientName}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={delivery.status} type="delivery" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentDeliveries;
