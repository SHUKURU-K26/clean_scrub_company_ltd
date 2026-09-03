import { useEffect, useState } from 'react';
import { Boxes, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import HealthScoreHero from '../../components/dashboard/HealthScoreHero';
import StatCard from '../../components/charts/StatCard';
import StockTrendChart from '../../components/charts/StockTrendChart';
import CategoryBarChart from '../../components/charts/CategoryBarChart';
import ClientTypeDonut from '../../components/charts/ClientTypeDonut';
import RecentActivity from '../../components/dashboard/RecentActivity';
import LowStockAlerts from '../../components/dashboard/LowStockAlerts';
import { getDashboardStats } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/formatCurrency';
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
  const healthScore = s && s.totalProducts > 0 ? Math.round(((s.totalProducts - s.lowStockCount) / s.totalProducts) * 100) : 100;
  const netMovement = s ? s.todayStockIn - s.todayStockOut : 0;
  const stockInSparkline = data?.trend?.slice(-7).map((d) => d.stockIn);
  const stockOutSparkline = data?.trend?.slice(-7).map((d) => d.stockOut);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-800 dark:text-white">
          Welcome back{user?.name ? `, ${user.name}` : ''} 👋
        </h1>
        <p className="text-sm text-navy-400 dark:text-navy-300 mt-1">Here's what's happening with your inventory today.</p>
      </div>

      <HealthScoreHero
        score={healthScore}
        lowStockCount={s?.lowStockCount || 0}
        totalValue={s?.totalStockValue || 0}
        netMovement={netMovement}
        loading={loading}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Boxes} label="Total Products" value={s?.totalProducts || 0} loading={loading} gradient="from-navy-700 to-navy-500" delay={0} />
        <StatCard icon={Wallet} label="Total Stock Value" value={s?.totalStockValue || 0} format={formatCurrency} loading={loading} gradient="from-green-600 to-green-400" delay={0.05} />
        <StatCard icon={ArrowDownToLine} label="Stock In Today" value={s?.todayStockIn || 0} change={s?.stockInChange} loading={loading} gradient="from-mint-500 to-green-400" delay={0.1} sparkline={stockInSparkline} sparklineColor="#16A34A" />
        <StatCard icon={ArrowUpFromLine} label="Stock Out Today" value={s?.todayStockOut || 0} change={s?.stockOutChange} loading={loading} gradient="from-amber-500 to-amber-400" delay={0.15} sparkline={stockOutSparkline} sparklineColor="#F59E0B" />
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