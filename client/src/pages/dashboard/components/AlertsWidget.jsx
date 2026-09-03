// FleetHub – Alerts Widget Component
import { MOCK_ALERTS } from '@/data/mockData';
import Card from '@/components/common/Card';
import { timeAgo } from '@/utils/formatDate';
import {
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

const ALERT_CONFIG = {
  warning: {
    icon: HiOutlineExclamationTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  error: {
    icon: HiOutlineXCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
  },
  info: {
    icon: HiOutlineInformationCircle,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
  },
  success: {
    icon: HiOutlineCheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-500/10',
  },
};

const AlertsWidget = () => {
  return (
    <Card>
      <Card.Header>
        <div>
          <Card.Title>System Alerts</Card.Title>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fleet warnings & critical notices</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-secondary-400 hover:text-primary-700 dark:hover:text-secondary-300 transition-colors">
          View all
          <HiOutlineArrowRight className="w-3.5 h-3.5" />
        </button>
      </Card.Header>

      <div className="space-y-2.5">
        {MOCK_ALERTS.map((alert) => {
          const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info;
          const Icon = config.icon;

          return (
            <div
              key={alert._id}
              className={`flex items-start gap-3 p-2.5 rounded-lg transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 border ${
                !alert.read
                  ? 'border-primary-200/70 dark:border-primary-800/40 bg-primary-50/20 dark:bg-primary-950/20'
                  : 'border-transparent hover:border-slate-200/80 dark:hover:border-slate-800'
              }`}
            >
              <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0 mt-0.5`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {alert.title}
                  </p>
                  {!alert.read && (
                    <span className="w-2 h-2 rounded-full bg-primary-600 dark:bg-secondary-400 flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {alert.message}
                </p>
                <p className="text-2xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                  {timeAgo(alert.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AlertsWidget;
