import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import MobileNav from './MobileNav.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-bg text-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        {/* pb-20 leaves room for the mobile bottom nav so content doesn't get covered. */}
        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-6 overflow-x-hidden pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
