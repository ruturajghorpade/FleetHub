// FleetHub – Application Router
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import NotFoundPage from '@/pages/errors/NotFoundPage';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const AppRouter = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Main layout wrapper */}
        <Route element={<MainLayout />}>
          {/* Dashboard placeholder */}
          <Route
            index
            element={
              <div className="animate-fade-in">
                <h1 className="page-title mb-2">Dashboard</h1>
                <p className="text-dark-500 dark:text-dark-400">
                  Welcome to FleetHub. Dashboard will be built in a future phase.
                </p>
              </div>
            }
          />
        </Route>

        {/* 404 – Outside layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRouter;
