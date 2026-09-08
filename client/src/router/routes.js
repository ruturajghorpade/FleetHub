// FleetHub – Route Definitions with Role Permissions (Food Delivery Logistics Platform)
import { lazy } from 'react';
import ROUTES from '@/config/routeConfig';
import { ROLES } from '@/config/roleConfig';

// Lazy-loaded pages
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const DeliveryListPage = lazy(() => import('@/pages/deliveries/DeliveryListPage'));
const DeliveryDetailsPage = lazy(() => import('@/pages/deliveries/DeliveryDetailsPage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const ClientListPage = lazy(() => import('@/pages/clients/ClientListPage'));
const BranchListPage = lazy(() => import('@/pages/branches/BranchListPage'));
const VehicleListPage = lazy(() => import('@/pages/vehicles/VehicleListPage'));
const DriverListPage = lazy(() => import('@/pages/drivers/DriverListPage'));
const MaintenanceListPage = lazy(() => import('@/pages/maintenance/MaintenanceListPage'));
const RouteListPage = lazy(() => import('@/pages/routes/RouteListPage'));
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'));
const UserListPage = lazy(() => import('@/pages/users/UserListPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const UnauthorizedPage = lazy(() => import('@/pages/auth/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));

/**
 * Route definitions
 * - layout: 'main' | 'auth' | 'none'
 * - auth: whether the route requires authentication
 * - allowedRoles: which roles are permitted access (enforced by RoleRoute)
 */
export const appRoutes = [
  {
    path: ROUTES.DASHBOARD,
    element: DashboardPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER, ROLES.DRIVER],
    title: 'Dashboard',
  },
  {
    path: ROUTES.DELIVERIES,
    element: DeliveryListPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER, ROLES.DRIVER],
    title: 'Food Deliveries',
  },
  {
    path: ROUTES.DELIVERY_DETAILS,
    element: DeliveryDetailsPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER, ROLES.DRIVER],
    title: 'Delivery Tracking & Details',
  },
  {
    path: ROUTES.ROUTES_LIST,
    element: RouteListPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER, ROLES.DRIVER],
    title: 'Active Corridors',
  },
  {
    path: ROUTES.VEHICLES,
    element: VehicleListPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.DISPATCHER],
    title: 'EV Fleet & Bikes',
  },
  {
    path: ROUTES.DRIVERS,
    element: DriverListPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.DISPATCHER],
    title: 'Driver Partners',
  },
  {
    path: ROUTES.MAINTENANCE,
    element: MaintenanceListPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.DISPATCHER],
    title: 'Vehicle Maintenance',
  },
  {
    path: ROUTES.CLIENTS,
    element: ClientListPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN],
    title: 'Restaurant Clients',
  },
  {
    path: ROUTES.BRANCHES,
    element: BranchListPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER],
    title: 'Kitchen Outlets & Hubs',
  },
  {
    path: ROUTES.REPORTS,
    element: ReportsPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER],
    title: 'Reports & Intelligence',
  },
  {
    path: ROUTES.USERS,
    element: UserListPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN],
    title: 'User Management',
  },
  {
    path: ROUTES.NOTIFICATIONS,
    element: NotificationsPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER, ROLES.DRIVER],
    title: 'Notifications & Alerts',
  },
  {
    path: ROUTES.SETTINGS,
    element: SettingsPage,
    layout: 'main',
    auth: true,
    allowedRoles: [ROLES.SUPER_ADMIN, ROLES.CLIENT_ADMIN, ROLES.DISPATCHER, ROLES.DRIVER],
    title: 'System Settings',
  },
];

export const authRoutes = [
  {
    path: ROUTES.LOGIN,
    element: LoginPage,
    layout: 'auth',
    auth: false,
    title: 'Login',
  },
  {
    path: ROUTES.REGISTER,
    element: RegisterPage,
    layout: 'auth',
    auth: false,
    title: 'Register',
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: UnauthorizedPage,
    layout: 'none',
    auth: false,
    title: 'Unauthorized',
  },
];

export const errorRoutes = [
  {
    path: '*',
    element: NotFoundPage,
    layout: 'none',
    auth: false,
    title: 'Page Not Found',
  },
];

export default [...appRoutes, ...authRoutes, ...errorRoutes];
