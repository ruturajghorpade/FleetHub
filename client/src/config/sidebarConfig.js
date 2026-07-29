// FleetHub Sidebar Configuration
import {
  HiOutlineHome,
  HiOutlineBuildingOffice2,
  HiOutlineBuildingStorefront,
  HiOutlineTruck,
  HiOutlineUserGroup,
  HiOutlineCube,
  HiOutlineMapPin,
  HiOutlineWrenchScrewdriver,
  HiOutlineChartBarSquare,
  HiOutlineBell,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';

const SIDEBAR_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: HiOutlineHome,
  },
  {
    id: 'clients',
    label: 'Clients',
    path: '/clients',
    icon: HiOutlineBuildingOffice2,
  },
  {
    id: 'branches',
    label: 'Branches',
    path: '/branches',
    icon: HiOutlineBuildingStorefront,
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    path: '/vehicles',
    icon: HiOutlineTruck,
  },
  {
    id: 'drivers',
    label: 'Drivers',
    path: '/drivers',
    icon: HiOutlineUserGroup,
  },
  {
    id: 'deliveries',
    label: 'Deliveries',
    path: '/deliveries',
    icon: HiOutlineCube,
  },
  {
    id: 'routes',
    label: 'Routes',
    path: '/routes',
    icon: HiOutlineMapPin,
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    path: '/maintenance',
    icon: HiOutlineWrenchScrewdriver,
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: HiOutlineChartBarSquare,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/notifications',
    icon: HiOutlineBell,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: HiOutlineCog6Tooth,
  },
];

export default SIDEBAR_ITEMS;
