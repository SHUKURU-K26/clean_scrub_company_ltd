import { useEffect, useState } from 'react';
import { Boxes, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import StatCard from '../charts/StatCard';
import StockTrendChart from '../charts/StockTrendChart';
import CategoryBarChart from '../charts/CategoryBarChart';
import ClientTypeDonut from '../charts/ClientTypeDonut';
import RecentActivity from './RecentActivity';
import LowStockAlerts from './LowStockAlerts';
import { getDashboardStats } from '../../services/dashboardService';
import { formatCurrency, formatNumber } from '../../utils/formatCurrency';
import { useAuthStore } from '../../store/authStore';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    getDashboardStats().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const s = data?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-800 dark:text-white">
          Welcome back{user?.name ? `, ${user.name}` : ''} 👋
        </h1>
        <p className="text-sm text-navy-400 dark:text-navy-300 mt-1">Here's what's happening with your inventory today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Boxes} label="Total Products" value={loading ? '' : formatNumber(s.totalProducts)} loading={loading} gradient="from-navy-700 to-navy-500" delay={0} />
        <StatCard icon={Wallet} label="Total Stock Value" value={loading ? '' : formatCurrency(s.totalStockValue)} loading={loading} gradient="from-green-600 to-green-400" delay={0.05} />
        <StatCard icon={ArrowDownToLine} label="Stock In Today" value={loading ? '' : formatNumber(s.todayStockIn)} change={loading ? undefined : s.stockInChange} loading={loading} gradient="from-mint-500 to-green-400" delay={0.1} />
        <StatCard icon={ArrowUpFromLine} label="Stock Out Today" value={loading ? '' : formatNumber(s.todayStockOut)} change={loading ? undefined : s.stockOutChange} loading={loading} gradient="from-amber-500 to-amber-400" delay={0.15} />
      </div>

      {!loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StockTrendChart data={data.trend} />
            <ClientTypeDonut data={data.clientTypeBreakdown} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <CategoryBarChart data={data.categoryBreakdown} />
            <LowStockAlerts items={data.lowStockItems} />
          </div>

          <RecentActivity transactions={data.recentTransactions} />
        </>
      )}
    </div>
  );
}