// FleetHub – Application Router with RBAC Guards
import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Loader from '@/components/common/Loader';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';
import { appRoutes, authRoutes, errorRoutes } from './routes';

const AppRouter = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader message="Loading page..." />}>
        <Routes>
          {/* Authenticated routes with MainLayout */}
          <Route
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            {appRoutes.map((route) => {
              const Component = route.element;
              const content = route.allowedRoles?.length > 0 ? (
                <RoleRoute allowedRoles={route.allowedRoles}>
                  <Component />
                </RoleRoute>
              ) : (
                <Component />
              );

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  index={route.path === '/'}
                  element={content}
                />
              );
            })}
          </Route>

          {/* Auth routes (login, etc.) */}
          <Route element={<AuthLayout />}>
            {authRoutes
              .filter((r) => r.layout === 'auth')
              .map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.element />}
                />
              ))}
          </Route>

          {/* Standalone routes (no layout) */}
          {authRoutes
            .filter((r) => r.layout === 'none')
            .map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.element />}
              />
            ))}

          {/* Error routes */}
          {errorRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.element />}
            />
          ))}
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRouter;
