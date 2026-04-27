/**
 * SAL Education - College Attendance Management System
 * Layout Component
 * Provides consistent layout structure with Navbar and Sidebar
 * Used as wrapper for all authenticated pages
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Layout Component
 * Creates the main application layout with navigation and content area
 */
const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation bar - blue themed */}
      <Navbar />

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Side navigation - white with role-based menu */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden p-6">
          {/* Outlet renders the matched child route */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
