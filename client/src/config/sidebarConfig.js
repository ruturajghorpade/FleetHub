// FleetHub Sidebar Configuration – Grouped Navigation
import {
  HiOutlineHome,
  HiOutlineTruck,
  HiOutlineMapPin,
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineWrenchScrewdriver,
  HiOutlineBuildingOffice2,
  HiOutlineBuildingStorefront,
  HiOutlineUsers,
  HiOutlineChartBarSquare,
  HiOutlineBell,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';

/**
 * Sidebar navigation structure.
 * Each group has a `title` (section header) and an array of `items`.
 * Set `title` to `null` for ungrouped top-level items (e.g. Dashboard).
 */
const SIDEBAR_CONFIG = [
  {
    id: 'main',
    title: null,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/',
        icon: HiOutlineHome,
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    items: [
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
    ],
  },
  {
    id: 'fleet',
    title: 'Fleet',
    items: [
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
        id: 'maintenance',
        label: 'Maintenance',
        path: '/maintenance',
        icon: HiOutlineWrenchScrewdriver,
      },
    ],
  },
  {
    id: 'management',
    title: 'Management',
    items: [
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
        id: 'users',
        label: 'Users',
        path: '/users',
        icon: HiOutlineUsers,
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    items: [
      {
        id: 'reports',
        label: 'Reports',
        path: '/reports',
        icon: HiOutlineChartBarSquare,
      },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [
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
    ],
  },
];

export default SIDEBAR_CONFIG;
