// FleetHub – BreadcrumbNav Component
// Automatically generates breadcrumbs from the current route path.
import { useLocation } from 'react-router-dom';
import Breadcrumb from '@/components/common/Breadcrumb';
import { HiOutlineHome } from 'react-icons/hi2';

/**
 * Map route segments to human-readable labels.
 */
const SEGMENT_LABELS = {
  '': 'Dashboard',
  deliveries: 'Deliveries',
  routes: 'Routes',
  vehicles: 'Vehicles',
  drivers: 'Drivers',
  maintenance: 'Maintenance',
  clients: 'Clients',
  branches: 'Branches',
  users: 'Users',
  reports: 'Reports',
  notifications: 'Notifications',
  settings: 'Settings',
  new: 'Create New',
  edit: 'Edit',
};

const BreadcrumbNav = ({ className = '' }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // On the dashboard root, don't render breadcrumbs
  if (pathSegments.length === 0) return null;

  const items = [
    { label: 'Home', path: '/', icon: HiOutlineHome },
  ];

  let cumulativePath = '';
  pathSegments.forEach((segment, index) => {
    cumulativePath += `/${segment}`;
    const label = SEGMENT_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    items.push({
      label,
      path: index < pathSegments.length - 1 ? cumulativePath : null,
    });
  });

  return <Breadcrumb items={items} className={className} />;
};

export default BreadcrumbNav;
