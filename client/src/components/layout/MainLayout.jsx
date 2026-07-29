// FleetHub – Main Layout (Sidebar + Navbar + Content + Footer)
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useSidebar } from '@/context/SidebarContext';

const MainLayout = () => {
  const { collapsed, mobileOpen, closeMobileSidebar } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Main content area */}
      <div
        className={`flex flex-1 flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Header / Navbar */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-container">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
