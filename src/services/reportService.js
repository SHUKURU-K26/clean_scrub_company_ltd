import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } from 'date-fns';

export const DATE_PRESETS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
  { key: 'custom', label: 'Custom' },
];

export function getPresetRange(key) {
  const now = new Date();
  switch (key) {
    case 'today':
      return { from: format(startOfDay(now), 'yyyy-MM-dd'), to: format(endOfDay(now), 'yyyy-MM-dd') };
    case '7d':
      return { from: format(subDays(now, 6), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') };
    case '30d':
      return { from: format(subDays(now, 29), 'yyyy-MM-dd'), to: format(now, 'yyyy-MM-dd') };
    case 'month':
      return { from: format(startOfMonth(now), 'yyyy-MM-dd'), to: format(endOfMonth(now), 'yyyy-MM-dd') };
    case 'all':
    default:
      return { from: '', to: '' };
  }
}

export function computeReportSummary(transactions) {
  const stockIn = transactions.filter((t) => t.type === 'in');
  const stockOut = transactions.filter((t) => t.type === 'out');

  // Stock In value = cost of goods purchased (unit_price on an 'in' entry
  // is a snapshot of the product's cost price at that moment)
  const totalCostValue = stockIn.reduce((s, t) => s + t.quantity * t.unitPrice, 0);

  // Stock Out value = revenue actually charged (unit_price on an 'out'
  // entry is a snapshot of the product's selling price)
  const totalRevenue = stockOut.reduce((s, t) => s + t.quantity * t.unitPrice, 0);

  // Profit only applies to sales — costPriceAtSale is the cost snapshot
  // taken at the same moment, so it reflects the real margin at the time
  // of that specific sale
  const totalProfit = stockOut.reduce(
    (s, t) => s + t.quantity * (t.unitPrice - (t.costPriceAtSale ?? 0)),
    0
  );

  return {
    transactionCount: transactions.length,
    stockInCount: stockIn.length,
    stockOutCount: stockOut.length,
    totalCostValue,
    totalRevenue,
    totalProfit,
  };
}

export function buildDailyValueTrend(transactions) {
  const map = {};
  transactions.forEach((t) => {
    const key = t.date.slice(0, 10);
    if (!map[key]) map[key] = { date: key, stockIn: 0, stockOut: 0 };
    map[key][t.type === 'in' ? 'stockIn' : 'stockOut'] += t.quantity * t.unitPrice;
  });
  return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date));
}