// Derives per-customer stats from stock-out transaction history.
// Pure client-side aggregation for now — once FastAPI exists, this becomes
// a GET /customers endpoint that returns these fields already computed.
export function withCustomerStats(customers, transactions) {
  return customers.map((customer) => {
    const orders = transactions.filter((t) => t.type === 'out' && t.customerId === customer.id);
    const totalSpent = orders.reduce((sum, t) => sum + t.quantity * t.unitPrice, 0);
    const lastOrder = orders.length
      ? orders.reduce((latest, t) => (new Date(t.date) > new Date(latest.date) ? t : latest))
      : null;

    return {
      ...customer,
      orderCount: orders.length,
      totalSpent,
      lastPurchaseDate: lastOrder?.date || null,
      orders,
    };
  });
}