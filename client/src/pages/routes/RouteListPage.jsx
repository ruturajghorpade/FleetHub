// FleetHub – Active Delivery Routes & Live Dispatch Operations Page
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiOutlineMapPin,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowRight,
  HiOutlineTruck,
  HiOutlineUser,
  HiOutlineArrowPath,
  HiOutlineClock,
  HiOutlineCheckBadge,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import routeService from '@/services/routeService';
import { showError, showSuccess } from '@/utils/toastUtils';

const RouteListPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await routeService.getRoutes();
      setRoutes(data || []);
    } catch (err) {
      showError(err.message || 'Failed to load active delivery routes');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const handleRefresh = async () => {
    await loadRoutes();
    showSuccess('Refreshed active delivery routes');
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      const s = (r.status || '').toLowerCase();
      if (statusFilter !== 'all' && s !== statusFilter.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const routeId = (r.routeId || '').toLowerCase();
        const orderId = (r.orderId || '').toLowerCase();
        const origin = (r.origin || '').toLowerCase();
        const dest = (r.destination || '').toLowerCase();
        const driver = (r.assignedDriver || '').toLowerCase();
        if (
          !routeId.includes(q) &&
          !orderId.includes(q) &&
          !origin.includes(q) &&
          !dest.includes(q) &&
          !driver.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [routes, statusFilter, searchQuery]);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HiOutlineCheckBadge className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'in_transit':
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            In Transit
          </span>
        );
      case 'assigned':
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <HiOutlineClock className="w-3.5 h-3.5" />
            Rider Dispatched
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Ready for Pickup
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#242424] text-[#A3A3A3]">
            {status?.replace('_', ' ') || 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Active Dispatch Routes"
        subtitle="Live delivery transit corridors, outlet pickup hubs, customer destinations, and assigned delivery partners."
        actions={
          <Button
            variant="outline"
            leftIcon={<HiOutlineArrowPath className="w-4 h-4" />}
            onClick={handleRefresh}
          >
            Refresh Live Routes
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-[#A3A3A3] uppercase tracking-wider">Total Active Corridors</p>
          <p className="text-2xl font-black text-white mt-1">{routes.length}</p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-amber-400 uppercase tracking-wider">In Transit / Out</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {routes.filter((r) => ['in_transit', 'out_for_delivery'].includes((r.status || '').toLowerCase())).length}
          </p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-emerald-400 uppercase tracking-wider">Delivered Today</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {routes.filter((r) => (r.status || '').toLowerCase() === 'delivered').length}
          </p>
        </div>
        <div className="bg-[#111111] border border-[#2E2E2E] rounded-xl p-4">
          <p className="text-2xs font-semibold text-sky-400 uppercase tracking-wider">Assigned Riders</p>
          <p className="text-2xl font-black text-white mt-1">
            {routes.filter((r) => r.assignedDriver && r.assignedDriver !== 'Unassigned').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            <input
              type="text"
              placeholder="Search route, order ID, address, or rider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-amber-500 transition-colors"
            >
              <option value="all">All Transit Statuses</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Routes Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#A3A3A3]">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading live delivery routes...</span>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <Card className="col-span-full py-16 text-center text-[#A3A3A3]">
            <HiOutlineMapPin className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-base font-medium text-white">No active delivery routes found</p>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Active dispatch orders will automatically populate navigation routes here.
            </p>
          </Card>
        ) : (
          filteredRoutes.map((route) => (
            <Card key={route._id} className="p-5 border border-[#2E2E2E] hover:border-[#3E3E3E] transition-all">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#242424]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {route.routeId}
                  </span>
                  <span className="font-mono text-xs text-[#A3A3A3]">
                    {route.orderId}
                  </span>
                </div>
                {getStatusBadge(route.status)}
              </div>

              {/* Waypoints */}
              <div className="my-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xs font-semibold uppercase tracking-wider text-[#A3A3A3]">Origin Outlet / Kitchen</p>
                    <p className="text-sm font-semibold text-white leading-tight mt-0.5">
                      {route.origin}
                    </p>
                  </div>
                </div>

                <div className="ml-3 pl-3 border-l-2 border-dashed border-[#2E2E2E] py-1">
                  <div className="flex items-center gap-1 text-2xs text-amber-500/80 font-mono">
                    <HiOutlineArrowRight className="w-3.5 h-3.5" />
                    Express Fast Food Corridor
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineMapPin className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xs font-semibold uppercase tracking-wider text-[#A3A3A3]">Customer Drop-off Location</p>
                    <p className="text-sm font-semibold text-white leading-tight mt-0.5">
                      {route.destination}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignment Footer */}
              <div className="pt-3 border-t border-[#242424] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#242424] text-slate-300 flex items-center justify-center">
                    <HiOutlineUser className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-300 font-medium">
                    {route.assignedDriver}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                  <HiOutlineTruck className="w-4 h-4 text-amber-500" />
                  <span>{route.assignedVehicle}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RouteListPage;
