// FleetHub – Active Drivers Component
import { MOCK_DRIVERS } from '@/data/mockData';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { HiOutlineArrowRight } from 'react-icons/hi2';

const ActiveDrivers = () => {
  const activeDrivers = MOCK_DRIVERS.filter((d) => d.status === 'active').slice(0, 4);

  return (
    <Card>
      <Card.Header>
        <div>
          <Card.Title>Active Drivers</Card.Title>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">On-duty personnel</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-secondary-400 hover:text-primary-700 dark:hover:text-secondary-300 transition-colors">
          View all
          <HiOutlineArrowRight className="w-3.5 h-3.5" />
        </button>
      </Card.Header>

      <div className="space-y-2.5">
        {activeDrivers.map((driver) => (
          <div
            key={driver._id}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-800 transition-all cursor-pointer group"
          >
            <Avatar name={driver.name} size="md" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-secondary-400 transition-colors">
                {driver.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {driver.vehicle || 'Unassigned'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Badge variant="success" size="sm" dot>
                Active
              </Badge>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {driver.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActiveDrivers;
