import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, Receipt } from 'lucide-react';
import StatCard from '../charts/StatCard';
import { formatCurrency } from '../../utils/formatCurrency';

export default function ReportSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={ArrowDownToLine} label="Stock In Cost" value={summary.totalCostValue} format={formatCurrency} gradient="from-navy-700 to-navy-500" delay={0} />
      <StatCard icon={ArrowUpFromLine} label="Stock Out Revenue" value={summary.totalRevenue} format={formatCurrency} gradient="from-amber-500 to-amber-400" delay={0.05} />
      <StatCard icon={TrendingUp} label="Total Profit" value={summary.totalProfit} format={formatCurrency} gradient="from-green-600 to-green-400" delay={0.1} />
      <StatCard icon={Receipt} label="Transactions" value={summary.transactionCount} gradient="from-mint-500 to-green-400" delay={0.15} />
    </div>
  );
}