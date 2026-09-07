import { Printer, FileDown, FileSpreadsheet, Pencil, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { exportToPdf } from '../../utils/exportToPdf';
import { exportToExcel } from '../../utils/exportToExcel';

export default function ProductDetailModal({ open, onClose, product, onEdit, onDelete }) {
  if (!product) return null;
  const isLow = product.quantity <= product.reorderLevel;
  const marginPerUnit = product.sellingPrice - product.costPrice;

  const rows = [
    ['Name', product.name],
    ['SKU', product.sku],
    ['Category', product.category],
    ['Unit', product.unit],
    ['Quantity in stock', String(product.quantity)],
    ['Reorder level', String(product.reorderLevel)],
    ['Cost price', formatCurrency(product.costPrice)],
    ['Selling price', formatCurrency(product.sellingPrice)],
    ['Profit margin per unit', formatCurrency(marginPerUnit)],
    ['Total value (at cost)', formatCurrency(product.quantity * product.costPrice)],
  ];

  const handlePdf = () => exportToPdf({ title: product.name, columns: ['Field', 'Value'], rows, filename: product.sku });
  const handleExcel = () => exportToExcel({ title: product.name, columns: ['Field', 'Value'], rows, filename: product.sku });
  const handlePrint = () => window.print();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Product Details"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onEdit(product)}><Pencil className="w-4 h-4" /> Edit</Button>
          <Button variant="danger" onClick={() => onDelete(product)}><Trash2 className="w-4 h-4" /> Delete</Button>
        </>
      }
    >
      <div id="printable-area">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-display font-bold text-lg text-navy-800 dark:text-white">{product.name}</h4>
            <p className="text-xs text-navy-400 dark:text-navy-300">{product.sku}</p>
          </div>
          <Badge variant={isLow ? 'amber' : 'green'}>{isLow ? 'Low Stock' : 'In Stock'}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-xl glass p-3">
              <p className="text-[11px] font-medium text-navy-400 dark:text-navy-300 mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-navy-800 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-5 pt-4 border-t border-navy-100/50 dark:border-white/5">
        <Button variant="outline" onClick={handlePrint} className="flex-1"><Printer className="w-4 h-4" /> Print</Button>
        <Button variant="outline" onClick={handlePdf} className="flex-1"><FileDown className="w-4 h-4" /> PDF</Button>
        <Button variant="outline" onClick={handleExcel} className="flex-1"><FileSpreadsheet className="w-4 h-4" /> Excel</Button>
      </div>
    </Modal>
  );
}