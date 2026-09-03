// FleetHub – Revenue Chart Component
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { REVENUE_DATA } from '@/data/mockData';
import Card from '@/components/common/Card';
import { useTheme } from '@/context/ThemeContext';
import { formatCurrencyCompact } from '@/utils/formatCurrency';

const RevenueChart = () => {
  const { darkMode } = useTheme();

  const gridColor = darkMode ? '#1E293B' : '#E2E8F0';
  const textColor = darkMode ? '#94A3B8' : '#64748B';

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-900 shadow-lg rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-800 animate-fade-in">
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs py-0.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.dataKey}:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrencyCompact(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <Card.Header>
        <div>
          <Card.Title>Revenue & Expense Analysis</Card.Title>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Monthly financial overview for active fleet operations</p>
        </div>
      </Card.Header>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F6B7A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0F6B7A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: textColor }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: textColor }}
              tickFormatter={(val) => formatCurrencyCompact(val)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-slate-600 dark:text-slate-400 capitalize font-medium">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0F6B7A"
              strokeWidth={2.5}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#F59E0B"
              strokeWidth={2.5}
              fill="url(#colorExpenses)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RevenueChart;
