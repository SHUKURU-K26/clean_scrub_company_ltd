// Deterministic mock data (seeded, not Math.random directly) so numbers
// stay consistent across reloads instead of reshuffling every refresh.
// Replace with real API responses once FastAPI endpoints exist — every
// shape here (fields, nesting) is designed to match what those endpoints
// will return, so swapping the service layer later is a small change.

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);

export const CATEGORIES = [
  'Mops & Brooms',
  'Detergents & Chemicals',
  'PPE & Safety',
  'Machines & Equipment',
  'Paper & Disposables',
  'Air Fresheners',
];

export const CLIENT_TYPES = ['home', 'office', 'hotel', 'hospital'];

export const SUPPLIERS = [
  'KigaliClean Supplies',
  'EcoWash Distributors',
  'Rwanda Hygiene Co.',
  'PureLine Imports',
];

export const PRODUCTS = [
  { id: 'p01', name: 'Industrial Mop Set', sku: 'MOP-001', category: 'Mops & Brooms', unit: 'pcs', quantity: 8, reorderLevel: 10, unitPrice: 8500 },
  { id: 'p02', name: 'Push Broom Heavy Duty', sku: 'MOP-002', category: 'Mops & Brooms', unit: 'pcs', quantity: 45, reorderLevel: 15, unitPrice: 6200 },
  { id: 'p03', name: 'Microfiber Cloth Pack (12)', sku: 'MOP-003', category: 'Mops & Brooms', unit: 'pack', quantity: 120, reorderLevel: 30, unitPrice: 4500 },
  { id: 'p04', name: 'Multi-Surface Detergent 5L', sku: 'CHM-001', category: 'Detergents & Chemicals', unit: 'jerrycan', quantity: 6, reorderLevel: 20, unitPrice: 12000 },
  { id: 'p05', name: 'Floor Bleach 5L', sku: 'CHM-002', category: 'Detergents & Chemicals', unit: 'jerrycan', quantity: 34, reorderLevel: 15, unitPrice: 9500 },
  { id: 'p06', name: 'Glass Cleaner Spray 750ml', sku: 'CHM-003', category: 'Detergents & Chemicals', unit: 'bottle', quantity: 58, reorderLevel: 20, unitPrice: 3200 },
  { id: 'p07', name: 'Toilet Disinfectant 1L', sku: 'CHM-004', category: 'Detergents & Chemicals', unit: 'bottle', quantity: 12, reorderLevel: 25, unitPrice: 4800 },
  { id: 'p08', name: 'Disposable Gloves (Box 100)', sku: 'PPE-001', category: 'PPE & Safety', unit: 'box', quantity: 90, reorderLevel: 20, unitPrice: 15000 },
  { id: 'p09', name: 'Face Masks (Box 50)', sku: 'PPE-002', category: 'PPE & Safety', unit: 'box', quantity: 75, reorderLevel: 20, unitPrice: 9000 },
  { id: 'p10', name: 'Safety Goggles', sku: 'PPE-003', category: 'PPE & Safety', unit: 'pcs', quantity: 15, reorderLevel: 10, unitPrice: 3500 },
  { id: 'p11', name: 'Industrial Vacuum Cleaner', sku: 'EQP-001', category: 'Machines & Equipment', unit: 'unit', quantity: 4, reorderLevel: 3, unitPrice: 185000 },
  { id: 'p12', name: 'Floor Polisher Machine', sku: 'EQP-002', category: 'Machines & Equipment', unit: 'unit', quantity: 2, reorderLevel: 3, unitPrice: 420000 },
  { id: 'p13', name: 'Pressure Washer', sku: 'EQP-003', category: 'Machines & Equipment', unit: 'unit', quantity: 3, reorderLevel: 2, unitPrice: 265000 },
  { id: 'p14', name: 'Paper Towel Rolls (Pack 6)', sku: 'PPR-001', category: 'Paper & Disposables', unit: 'pack', quantity: 200, reorderLevel: 50, unitPrice: 6800 },
  { id: 'p15', name: 'Toilet Paper Rolls (Pack 24)', sku: 'PPR-002', category: 'Paper & Disposables', unit: 'pack', quantity: 15, reorderLevel: 40, unitPrice: 11500 },
  { id: 'p16', name: 'Garbage Bags Roll (50pcs)', sku: 'PPR-003', category: 'Paper & Disposables', unit: 'roll', quantity: 88, reorderLevel: 30, unitPrice: 3800 },
  { id: 'p17', name: 'Air Freshener Spray', sku: 'AFR-001', category: 'Air Fresheners', unit: 'bottle', quantity: 64, reorderLevel: 25, unitPrice: 4200 },
  { id: 'p18', name: 'Automatic Air Freshener Dispenser', sku: 'AFR-002', category: 'Air Fresheners', unit: 'unit', quantity: 9, reorderLevel: 5, unitPrice: 28000 },
];

export const CUSTOMERS = [
  { id: 'c01', name: 'Alice Uwimana', phone: '0788123456', type: 'home' },
  { id: 'c02', name: 'Kigali Heights Offices', phone: '0788234567', type: 'office' },
  { id: 'c03', name: 'Serena Hotel Kigali', phone: '0788345678', type: 'hotel' },
  { id: 'c04', name: 'King Faisal Hospital', phone: '0788456789', type: 'hospital' },
  { id: 'c05', name: 'Jean Bosco Habimana', phone: '0788567890', type: 'home' },
  { id: 'c06', name: 'Norrsken House Kigali', phone: '0788678901', type: 'office' },
  { id: 'c07', name: 'Radisson Blu Hotel', phone: '0788789012', type: 'hotel' },
  { id: 'c08', name: 'Rwanda Military Hospital', phone: '0788890123', type: 'hospital' },
  { id: 'c09', name: 'Marie Claire Mukamana', phone: '0788901234', type: 'home' },
  { id: 'c10', name: 'BK Group Headquarters', phone: '0789012345', type: 'office' },
  { id: 'c11', name: 'Ubumwe Grande Hotel', phone: '0789123456', type: 'hotel' },
  { id: 'c12', name: 'CHUK Hospital', phone: '0789234567', type: 'hospital' },
];

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function generateTransactions(days = 30) {
  const transactions = [];
  let idCounter = 1;
  const today = new Date();

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const count = 2 + Math.floor(rand() * 4);

    for (let i = 0; i < count; i++) {
      const type = rand() > 0.48 ? 'out' : 'in';
      const product = pick(PRODUCTS);
      const quantity = type === 'in' ? 5 + Math.floor(rand() * 40) : 1 + Math.floor(rand() * 12);
      const txDate = new Date(date);
      txDate.setHours(8 + Math.floor(rand() * 9), Math.floor(rand() * 60));

      const base = {
        id: `tx${String(idCounter++).padStart(4, '0')}`,
        type,
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity,
        unitPrice: product.unitPrice,
        date: txDate.toISOString(),
      };

      if (type === 'out') {
        const customer = pick(CUSTOMERS);
        transactions.push({ ...base, customerId: customer.id, customerName: customer.name, customerType: customer.type, customerPhone: customer.phone });
      } else {
        transactions.push({ ...base, supplier: pick(SUPPLIERS) });
      }
    }
  }

  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export const TRANSACTIONS = generateTransactions(30);