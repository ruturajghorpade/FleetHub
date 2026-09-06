// FleetHub – Fleet Overview Chart (Donut)
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FLEET_STATUS_DATA } from '@/data/mockData';
import Card from '@/components/common/Card';

const FleetOverview = () => {
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const { name, value } = payload[0];
    return (
      <div className="bg-white dark:bg-[#111111] shadow-xl rounded-xl px-3.5 py-2 border border-neutral-200 dark:border-[#2E2E2E]">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {name}: <span className="text-amber-500 font-bold">{value} units</span>
        </p>
      </div>
    );
  };

  const renderLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#A3A3A3] font-medium">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <Card.Header>
        <div>
          <Card.Title>Fleet Status</Card.Title>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">Real-time vehicle availability</p>
        </div>
      </Card.Header>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={FLEET_STATUS_DATA}
              cx="50%"
              cy="45%"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {FLEET_STATUS_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default FleetOverview;
