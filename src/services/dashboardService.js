import { PRODUCTS, CUSTOMERS, TRANSACTIONS, CATEGORIES } from '../data/mockData';
import { isDateToday } from '../utils/formatDate';

// Stub — replace with a real GET /dashboard/summary call to FastAPI.
// Everything below is aggregation that will eventually happen server-side;
// keeping the shape identical means the Dashboard component won't need
// to change when this swaps to a real fetch.
export async function getDashboardStats() {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const totalProducts = PRODUCTS.length;
  const totalStockValue = PRODUCTS.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const lowStockItems = PRODUCTS.filter((p) => p.quantity <= p.reorderLevel)
    .sort((a, b) => a.quantity / a.reorderLevel - b.quantity / b.reorderLevel);

  const todayTx = TRANSACTIONS.filter((t) => isDateToday(t.date));
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yestTx = TRANSACTIONS.filter((t) => new Date(t.date).toDateString() === yesterday.toDateString());

  const todayStockIn = todayTx.filter((t) => t.type === 'in').reduce((s, t) => s + t.quantity, 0);
  const todayStockOut = todayTx.filter((t) => t.type === 'out').reduce((s, t) => s + t.quantity, 0);
  const yestStockIn = yestTx.filter((t) => t.type === 'in').reduce((s, t) => s + t.quantity, 0);
  const yestStockOut = yestTx.filter((t) => t.type === 'out').reduce((s, t) => s + t.quantity, 0);

  const pctChange = (curr, prev) => (prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100));

  // Last 30 days trend, grouped by day
  const trendMap = {};
  TRANSACTIONS.forEach((t) => {
    const key = new Date(t.date).toISOString().slice(0, 10);
    if (!trendMap[key]) trendMap[key] = { date: key, stockIn: 0, stockOut: 0 };
    trendMap[key][t.type === 'in' ? 'stockIn' : 'stockOut'] += t.quantity;
  });
  const trend = Object.values(trendMap).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Category breakdown by current stock value
  const categoryBreakdown = CATEGORIES.map((cat) => ({
    name: cat,
    value: PRODUCTS.filter((p) => p.category === cat).reduce((s, p) => s + p.quantity * p.unitPrice, 0),
  })).sort((a, b) => b.value - a.value);

  // Client type breakdown by stock-out volume
  const typeMap = {};
  TRANSACTIONS.filter((t) => t.type === 'out').forEach((t) => {
    typeMap[t.customerType] = (typeMap[t.customerType] || 0) + t.quantity;
  });
  const clientTypeBreakdown = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  return {
    stats: {
      totalProducts,
      totalStockValue,
      lowStockCount: lowStockItems.length,
      totalCustomers: CUSTOMERS.length,
      todayStockIn,
      todayStockOut,
      stockInChange: pctChange(todayStockIn, yestStockIn),
      stockOutChange: pctChange(todayStockOut, yestStockOut),
    },
    trend,
    categoryBreakdown,
    clientTypeBreakdown,
    recentTransactions: TRANSACTIONS.slice(0, 8),
    lowStockItems: lowStockItems.slice(0, 6),
  };
}