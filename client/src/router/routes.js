// FleetHub – Route Definitions (Food Delivery Logistics)
import { lazy } from 'react';
import ROUTES from '@/config/routeConfig';

// Lazy-loaded pages
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const DeliveryListPage = lazy(() => import('@/pages/deliveries/DeliveryListPage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const UnauthorizedPage = lazy(() => import('@/pages/auth/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));

/**
 * Route definitions
 * - layout: 'main' | 'auth' | 'none'
 * - auth: whether the route requires authentication
 */
export const appRoutes = [
  {
    path: ROUTES.DASHBOARD,
    element: DashboardPage,
    layout: 'main',
    auth: true,
    title: 'Dashboard',
  },
  {
    path: ROUTES.DELIVERIES,
    element: DeliveryListPage,
    layout: 'main',
    auth: true,
    title: 'Deliveries',
  },
  {
    path: ROUTES.REPORTS,
    element: ReportsPage,
    layout: 'main',
    auth: true,
    title: 'Reports & Intelligence',
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
