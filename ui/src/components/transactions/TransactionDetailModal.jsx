import { Printer, FileDown, FileSpreadsheet, Pencil, Trash2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { exportToPdf } from '../../utils/exportToPdf';
import { exportToExcel } from '../../utils/exportToExcel';

export default function TransactionDetailModal({ open, onClose, transaction, onEdit, onDelete }) {
  if (!transaction) return null;
  const isIn = transaction.type === 'in';

  const totalValue = transaction.quantity * transaction.unitPrice;
  const profit = !isIn && transaction.costPriceAtSale != null
    ? transaction.quantity * (transaction.unitPrice - transaction.costPriceAtSale)
    : null;

  const rows = [
    ['Product', transaction.productName],
    ['Category', transaction.category],
    ['Quantity', String(transaction.quantity)],
    [isIn ? 'Cost Price' : 'Selling Price', formatCurrency(transaction.unitPrice)],
    [isIn ? 'Total Cost' : 'Total Revenue', formatCurrency(totalValue)],
    ...(profit !== null ? [['Profit', formatCurrency(profit)]] : []),
    isIn ? ['Supplier', transaction.supplier] : ['Customer', transaction.customerName],
    ...(isIn ? [] : [['Phone', transaction.customerPhone], ['Client Type', transaction.customerType]]),
    ['Date & Time', formatDateTime(transaction.date)],
  ];

  const handlePdf = () => exportToPdf({ title: `${isIn ? 'Stock In' : 'Stock Out'} — ${transaction.productName}`, columns: ['Field', 'Value'], rows, filename: transaction.id });
  const handleExcel = () => exportToExcel({ title: isIn ? 'Stock In' : 'Stock Out', columns: ['Field', 'Value'], rows, filename: transaction.id });
  const handlePrint = () => window.print();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isIn ? 'Stock In Details' : 'Stock Out Details'}
      size="md"
     footer={
        (onEdit || onDelete) ? (
          <>
            {onEdit && <Button variant="outline" onClick={() => onEdit(transaction)}><Pencil className="w-4 h-4 cursor-pointer" /> Edit</Button>}
            {onDelete && <Button variant="danger" onClick={() => onDelete(transaction)}><Trash2 className="w-4 h-4 cursor-pointer" /> Delete</Button>}
          </>
        ) : null
      }
    >
      <div id="printable-area">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isIn ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>
              {isIn ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-display font-bold text-navy-800 dark:text-white">{transaction.productName}</h4>
              <p className="text-xs text-navy-400 dark:text-navy-300">{transaction.id}</p>
            </div>
          </div>
          <Badge variant={isIn ? 'green' : 'amber'}>{isIn ? 'Stock In' : 'Stock Out'}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-xl glass p-3">
              <p className="text-[11px] font-medium text-navy-400 dark:text-navy-300 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-navy-800 dark:text-white capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-5 pt-4 border-t border-navy-100/50 dark:border-white/5">
        <Button variant="outline" onClick={handlePrint} className="flex-1 cursor-pointer"><Printer className="w-4 h-4" /> Print</Button>
        <Button variant="outline" onClick={handlePdf} className="flex-1 cursor-pointer"><FileDown className="w-4 h-4" /> PDF</Button>
        <Button variant="outline" onClick={handleExcel} className="flex-1 cursor-pointer"><FileSpreadsheet className="w-4 h-4" /> Excel</Button>
      </div>
    </Modal>
  );
}