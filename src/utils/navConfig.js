import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  FileBarChart2,
  Settings as SettingsIcon,
} from 'lucide-react';

export const NAV_ITEMS = [
  { key: 'dashboard', path: '/', icon: LayoutDashboard },
  { key: 'products', path: '/products', icon: Package },
  { key: 'stockIn', path: '/stock-in', icon: ArrowDownToLine },
  { key: 'stockOut', path: '/stock-out', icon: ArrowUpFromLine },
  { key: 'customers', path: '/customers', icon: Users },
  { key: 'reports', path: '/reports', icon: FileBarChart2 },
  { key: 'settings', path: '/settings', icon: SettingsIcon },
];

// First 4 sit directly in the mobile bottom tab bar; the rest live behind "More"
export const MOBILE_PRIMARY_NAV = NAV_ITEMS.slice(0, 4);
export const MOBILE_MORE_NAV = NAV_ITEMS.slice(4);