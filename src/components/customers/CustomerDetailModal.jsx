import { Printer, FileDown, FileSpreadsheet, Pencil, Trash2, Phone, ShoppingBag, Wallet, Clock } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime, formatRelative } from '../../utils/formatDate';
import { exportToPdf } from '../../utils/exportToPdf';
import { exportToExcel } from '../../utils/exportToExcel';

export default function CustomerDetailModal({ open, onClose, customer, onEdit, onDelete }) {
  if (!customer) return null;

  const profileRows = [
    ['Name', customer.name],
    ['Phone', customer.phone],
    ['Client Type', customer.type],
    ['Total Orders', String(customer.orderCount)],
    ['Total Spent', formatCurrency(customer.totalSpent)],
    ['Last Purchase', customer.lastPurchaseDate ? formatDateTime(customer.lastPurchaseDate) : 'No purchases yet'],
  ];

  const handlePdf = () => exportToPdf({
    title: `${customer.name} — Purchase History`,
    columns: ['Product', 'Quantity', 'Value', 'Date'],
    rows: customer.orders.map((o) => [o.productName, String(o.quantity), formatCurrency(o.quantity * o.unitPrice), formatDateTime(o.date)]),
    filename: `customer-${customer.id}`,
  });
  const handleExcel = () => exportToExcel({
    title: 'Purchase History',
    columns: ['Product', 'Quantity', 'Value', 'Date'],
    rows: customer.orders.map((o) => [o.productName, String(o.quantity), formatCurrency(o.quantity * o.unitPrice), formatDateTime(o.date)]),
    filename: `customer-${customer.id}`,
  });
  const handlePrint = () => window.print();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Customer Details"
      size="lg"
      footer={
        <>
          <Button variant="outline" className="cursor-pointer" onClick={() => onEdit(customer)}><Pencil className="w-4 h-4 " /> Edit</Button>
          <Button variant="danger" className="cursor-pointer" onClick={() => onDelete(customer)}><Trash2 className="w-4 h-4 " /> Delete</Button>
        </>
      }
    >
      <div id="printable-area">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-700 to-green-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-navy-800 dark:text-white truncate">{customer.name}</h4>
            <p className="text-xs text-navy-400 dark:text-navy-300 flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</p>
          </div>
          <Badge variant="navy" className="capitalize shrink-0">{customer.type}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl glass p-3 text-center">
            <ShoppingBag className="w-4 h-4 text-green-500 mx-auto mb-1.5" />
            <p className="text-lg font-display font-bold text-navy-800 dark:text-white">{customer.orderCount}</p>
            <p className="text-[10px] text-navy-400 dark:text-navy-300">Orders</p>
          </div>
          <div className="rounded-xl glass p-3 text-center">
            <Wallet className="w-4 h-4 text-green-500 mx-auto mb-1.5" />
            <p className="text-sm font-display font-bold text-navy-800 dark:text-white">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-[10px] text-navy-400 dark:text-navy-300">Total Spent</p>
          </div>
          <div className="rounded-xl glass p-3 text-center">
            <Clock className="w-4 h-4 text-green-500 mx-auto mb-1.5" />
            <p className="text-xs font-display font-bold text-navy-800 dark:text-white">
              {customer.lastPurchaseDate ? formatRelative(customer.lastPurchaseDate) : '—'}
            </p>
            <p className="text-[10px] text-navy-400 dark:text-navy-300">Last Order</p>
          </div>
        </div>

        <h5 className="text-xs font-semibold uppercase tracking-wide text-navy-400 dark:text-navy-300 mb-2.5">Purchase History</h5>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-navy-400 dark:text-navy-300 py-6 text-center rounded-xl glass">No purchases recorded yet</p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {customer.orders.slice(0, 10).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl glass px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-700 dark:text-white truncate">{o.productName}</p>
                  <p className="text-[11px] text-navy-400 dark:text-navy-300">{formatDateTime(o.date)}</p>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <p className="text-sm font-bold text-amber-600">-{o.quantity}</p>
                  <p className="text-[11px] text-navy-400 dark:text-navy-300">{formatCurrency(o.quantity * o.unitPrice)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-5 pt-4 border-t border-navy-100/50 dark:border-white/5">
        <Button variant="outline" onClick={handlePrint} className="flex-1 cursor-pointer"><Printer className="w-4 h-4" /> Print</Button>
        <Button variant="outline" onClick={handlePdf} className="flex-1 cursor-pointer"><FileDown className="w-4 h-4" /> PDF</Button>
        <Button variant="outline" onClick={handleExcel} className="flex-1 cursor-pointer"><FileSpreadsheet className="w-4 h-4" /> Excel</Button>
      </div>
    </Modal>
  );
}