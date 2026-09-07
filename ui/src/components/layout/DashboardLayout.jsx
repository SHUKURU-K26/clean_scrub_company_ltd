import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileTabBar from './MobileTabBar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <TopBar />
      <MobileTabBar />

      <main className="lg:pl-64 pt-16 pb-20 lg:pb-6 min-h-screen">
        <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}