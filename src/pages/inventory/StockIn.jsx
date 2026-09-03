import { useState, useMemo } from 'react';
import { Plus, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../components/tables/DataTable';
import DataCardList from '../../components/tables/DataCardList';
import TableFilters from '../../components/tables/TableFilters';
import BulkActionBar from '../../components/tables/BulkActionBar';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StockInFormModal from '../../components/transactions/StockInFormModal';
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { exportToPdf } from '../../utils/exportToPdf';
import { exportToExcel } from '../../utils/exportToExcel';

export default function StockIn() {
  const allTransactions = useTransactionStore((state) => state.transactions);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const deleteMultipleTransactions = useTransactionStore((state) => state.deleteMultipleTransactions);
  const transactions = useMemo(() => allTransactions.filter((t) => t.type === 'in'), [allTransactions]);

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [viewingTx, setViewingTx] = useState(null);
  const [deletingTx, setDeletingTx] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = !search || t.productName.toLowerCase().includes(search.toLowerCase()) || t.supplier.toLowerCase().includes(search.toLowerCase());
      const txDate = t.date.slice(0, 10);
      const matchesFrom = !dateFrom || txDate >= dateFrom;
      const matchesTo = !dateTo || txDate <= dateTo;
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [transactions, search, dateFrom, dateTo]);

  const activeFilterCount = (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  const toggleSelect = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleSelectAll = (ids, checked) => setSelectedIds(checked ? ids : []);
  const clearSelection = () => setSelectedIds([]);

  const handleAdd = () => { setEditingTx(null); setFormOpen(true); };
  const handleEdit = (tx) => { setViewingTx(null); setEditingTx(tx); setFormOpen(true); };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    await deleteTransaction(deletingTx.id);
    setDeleting(false);
    setDeletingTx(null);
    setViewingTx(null);
    toast.success('Entry deleted and stock adjusted');
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    await deleteMultipleTransactions(selectedIds);
    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    toast.success(`${selectedIds.length} entries deleted and stock adjusted`);
    clearSelection();
  };

  const selectedRows = useMemo(() => transactions.filter((t) => selectedIds.includes(t.id)), [transactions, selectedIds]);
  const bulkColumns = ['Product', 'Quantity', 'Supplier', 'Value', 'Date'];
  const bulkRows = () => selectedRows.map((t) => [t.productName, `+${t.quantity}`, t.supplier, formatCurrency(t.quantity * t.unitPrice), formatDateTime(t.date)]);

  const handleBulkExportPdf = () => exportToPdf({ title: 'Stock In — Selected Entries', columns: bulkColumns, rows: bulkRows(), filename: 'stock-in-selected' });
  const handleBulkExportExcel = () => exportToExcel({ title: 'Stock In', columns: bulkColumns, rows: bulkRows(), filename: 'stock-in-selected' });

  const columns = [
    {
      accessorKey: 'productName',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-navy-800 dark:text-white">{row.original.productName}</p>
          <p className="text-xs text-navy-400 dark:text-navy-300">{row.original.category}</p>
        </div>
      ),
    },
    { accessorKey: 'quantity', header: 'Quantity', cell: ({ row }) => <span className="font-semibold text-green-600">+{row.original.quantity}</span> },
    { accessorKey: 'supplier', header: 'Supplier' },
    { id: 'totalValue', header: 'Value', cell: ({ row }) => formatCurrency(row.original.quantity * row.original.unitPrice) },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDateTime(getValue()) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-800 dark:text-white">Stock In</h1>
          <p className="text-sm text-navy-400 dark:text-navy-300 mt-1">{transactions.length} entries recorded</p>
        </div>
        <Button onClick={handleAdd} className="cursor-pointer">
          <Plus className="w-4 h-4" /> Record Stock In
        </Button>
      </div>

      <div className="rounded-2xl glass p-4 sm:p-5">
        <TableFilters search={search} onSearchChange={setSearch} placeholder="Search by product or supplier..." activeCount={activeFilterCount}>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none" />
            <span className="text-xs text-navy-400">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none" />
          </div>
        </TableFilters>

        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={setViewingTx}
          emptyMessage="No stock-in entries match your filters"
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />

        <DataCardList
          data={filtered}
          onCardClick={setViewingTx}
          emptyMessage="No stock-in entries match your filters"
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          renderCard={(t) => (
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center shrink-0 text-green-600">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-800 dark:text-white truncate">{t.productName}</p>
                <p className="text-xs text-navy-400 dark:text-navy-300 mb-2">{t.supplier} · {formatDateTime(t.date)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-green-600">+{t.quantity}</span>
                  <span className="text-sm font-semibold text-navy-700 dark:text-navy-100">{formatCurrency(t.quantity * t.unitPrice)}</span>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <StockInFormModal open={formOpen} onClose={() => setFormOpen(false)} transaction={editingTx} />

      <TransactionDetailModal
        open={!!viewingTx}
        onClose={() => setViewingTx(null)}
        transaction={viewingTx}
        onEdit={handleEdit}
        onDelete={(t) => setDeletingTx(t)}
      />

      <ConfirmDialog
        open={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete this entry?"
        description="This will remove the entry and adjust the product's stock level accordingly."
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
        title={`Delete ${selectedIds.length} entries?`}
        description="Each entry's stock effect will be reversed. This can't be undone."
      />

      <BulkActionBar
        count={selectedIds.length}
        onClear={clearSelection}
        onDelete={() => setBulkDeleteOpen(true)}
        onExportPdf={handleBulkExportPdf}
        onExportExcel={handleBulkExportExcel}
      />
    </div>
  );
}