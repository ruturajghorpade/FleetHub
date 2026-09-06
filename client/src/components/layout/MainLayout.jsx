// FleetHub – Main Layout (Sidebar + MobileSidebar + Header + Content + Footer)
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import Footer from './Footer';
import { useSidebar } from '@/context/SidebarContext';

const MainLayout = () => {
  const { collapsed } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5] dark:bg-[#090909] text-[#171717] dark:text-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar (overlay drawer) */}
      <MobileSidebar />

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
