import { useState, useMemo, useEffect } from 'react';
import { FileDown, FileSpreadsheet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../components/tables/DataTable';
import DataCardList from '../../components/tables/DataCardList';
import TableFilters from '../../components/tables/TableFilters';
import BulkActionBar from '../../components/tables/BulkActionBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DateRangeSelector from '../../components/reports/DateRangeSelector';
import ReportSummaryCards from '../../components/reports/ReportSummaryCards';
import ReportTrendChart from '../../components/reports/ReportTrendChart';
import StockInFormModal from '../../components/transactions/StockInFormModal';
import StockOutFormModal from '../../components/transactions/StockOutFormModal';
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal';
import { useTransactionStore } from '../../store/transactionStore';
import { useCustomerStore } from '../../store/customerStore';
import { getPresetRange, computeReportSummary, buildDailyValueTrend } from '../../services/reportService';
import { CATEGORIES } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { exportToPdf } from '../../utils/exportToPdf';
import { exportToExcel } from '../../utils/exportToExcel';
import { cn } from '../../utils/cn';

export default function Reports() {
  const allTransactions = useTransactionStore((state) => state.transactions);
  const loading = useTransactionStore((state) => state.loading);
  const fetchTransactions = useTransactionStore((state) => state.fetchTransactions);
  const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const deleteMultipleTransactions = useTransactionStore((state) => state.deleteMultipleTransactions);

  useEffect(() => {
    fetchTransactions().catch((err) => toast.error(err.message || 'Failed to load report data'));
    fetchCustomers().catch((err) => toast.error(err.message || 'Failed to load customers'));
  }, [fetchTransactions, fetchCustomers]);

  const [preset, setPreset] = useState('30d');
  const [{ from, to }, setRange] = useState(getPresetRange('30d'));
  const [typeFilter, setTypeFilter] = useState('all');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const [viewingTx, setViewingTx] = useState(null);
  const [editingTx, setEditingTx] = useState(null);
  const [formType, setFormType] = useState(null); // 'in' | 'out' | null
  const [deletingTx, setDeletingTx] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handlePresetChange = (key) => {
    setPreset(key);
    if (key !== 'custom') setRange(getPresetRange(key));
  };
  const handleCustomChange = (f, t) => { setPreset('custom'); setRange({ from: f, to: t }); };

  const filtered = useMemo(() => {
    return allTransactions.filter((t) => {
      const txDate = t.date.slice(0, 10);
      const matchesFrom = !from || txDate >= from;
      const matchesTo = !to || txDate <= to;
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = !category || t.category === category;
      const party = t.type === 'in' ? t.supplier : t.customerName;
      const matchesSearch = !search || t.productName.toLowerCase().includes(search.toLowerCase()) || party.toLowerCase().includes(search.toLowerCase());
      const value = t.quantity * t.unitPrice;
      const matchesMin = !minAmount || value >= Number(minAmount);
      const matchesMax = !maxAmount || value <= Number(maxAmount);
      return matchesFrom && matchesTo && matchesType && matchesCategory && matchesSearch && matchesMin && matchesMax;
    });
  }, [allTransactions, from, to, typeFilter, category, search, minAmount, maxAmount]);

  const summary = useMemo(() => computeReportSummary(filtered), [filtered]);
  const trend = useMemo(() => buildDailyValueTrend(filtered), [filtered]);

  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0) + (category ? 1 : 0) + (minAmount ? 1 : 0) + (maxAmount ? 1 : 0);

  const toggleSelect = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleSelectAll = (ids, checked) => setSelectedIds(checked ? ids : []);
  const clearSelection = () => setSelectedIds([]);

  const handleEdit = (tx) => { setViewingTx(null); setEditingTx(tx); setFormType(tx.type); };
  const closeForm = () => { setFormType(null); setEditingTx(null); };

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

  const rowsForExport = (list) => list.map((t) => [
    t.type === 'in' ? 'Stock In' : 'Stock Out',
    t.productName,
    t.type === 'in' ? t.supplier : t.customerName,
    `${t.type === 'in' ? '+' : '-'}${t.quantity}`,
    formatCurrency(t.quantity * t.unitPrice),
    formatDateTime(t.date),
  ]);
  const exportColumns = ['Type', 'Product', 'Supplier / Customer', 'Quantity', 'Value', 'Date'];

  const handleReportPdf = () => exportToPdf({ title: 'Inventory Report', columns: exportColumns, rows: rowsForExport(filtered), filename: 'inventory-report' });
  const handleReportExcel = () => exportToExcel({ title: 'Inventory Report', columns: exportColumns, rows: rowsForExport(filtered), filename: 'inventory-report' });

  const selectedRows = useMemo(() => filtered.filter((t) => selectedIds.includes(t.id)), [filtered, selectedIds]);
  const handleSelectionPdf = () => exportToPdf({ title: 'Report — Selected Entries', columns: exportColumns, rows: rowsForExport(selectedRows), filename: 'report-selected' });
  const handleSelectionExcel = () => exportToExcel({ title: 'Report — Selected', columns: exportColumns, rows: rowsForExport(selectedRows), filename: 'report-selected' });

  const columns = [
    {
      id: 'type',
      header: 'Type',
      accessorFn: (row) => row.type,
      cell: ({ row }) => row.original.type === 'in' ? <Badge variant="green">Stock In</Badge> : <Badge variant="amber">Stock Out</Badge>,
    },
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
    {
      id: 'party',
      header: 'Supplier / Customer',
      cell: ({ row }) => row.original.type === 'in'
        ? <span className="text-navy-700 dark:text-navy-100">{row.original.supplier}</span>
        : (
          <div>
            <p className="text-navy-700 dark:text-navy-100">{row.original.customerName}</p>
            <p className="text-xs text-navy-400 dark:text-navy-300">{row.original.customerPhone}</p>
          </div>
        ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => row.original.type === 'in'
        ? <span className="font-semibold text-green-600">+{row.original.quantity}</span>
        : <span className="font-semibold text-amber-600">-{row.original.quantity}</span>,
    },
    { id: 'value', header: 'Value', cell: ({ row }) => formatCurrency(row.original.quantity * row.original.unitPrice) },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDateTime(getValue()) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-800 dark:text-white">Reports</h1>
          <p className="text-sm text-navy-400 dark:text-navy-300 mt-1">{filtered.length} transactions in this report</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReportPdf} className="cursor-pointer">
            <FileDown className="w-4 h-4 " /> Export PDF
          </Button>
          <Button variant="outline" onClick={handleReportExcel} className="cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 " /> Export Excel
          </Button>
        </div>
      </div>

      <div className="rounded-2xl glass p-4 sm:p-5">
        <DateRangeSelector preset={preset} onPresetChange={handlePresetChange} from={from} to={to} onCustomChange={handleCustomChange} />
      </div>

      <ReportSummaryCards summary={summary} />

      <ReportTrendChart data={trend} />

      <div className="rounded-2xl glass p-4 sm:p-5">
        <div className="flex gap-2 p-1 rounded-xl glass mb-4 w-fit">
          {[
            { key: 'all', label: 'All' },
            { key: 'in', label: 'Stock In', icon: ArrowDownToLine },
            { key: 'out', label: 'Stock Out', icon: ArrowUpFromLine },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors', typeFilter === key ? 'bg-green-500 text-white' : 'text-navy-400 dark:text-navy-300')}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />} {label}
            </button>
          ))}
        </div>

        <TableFilters search={search} onSearchChange={setSearch} placeholder="Search by product, supplier, or customer..." activeCount={activeFilterCount}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min RWF" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="h-9 w-28 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none" />
            <span className="text-xs text-navy-400">to</span>
            <input type="number" placeholder="Max RWF" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="h-9 w-28 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none" />
          </div>
        </TableFilters>

        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={setViewingTx}
          emptyMessage="No transactions match your filters"
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />

        <DataCardList
          data={filtered}
          onCardClick={setViewingTx}
          emptyMessage="No transactions match your filters"
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          renderCard={(t) => (
            <div className="flex items-start gap-3">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', t.type === 'in' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600')}>
                {t.type === 'in' ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-800 dark:text-white truncate">{t.productName}</p>
                <p className="text-xs text-navy-400 dark:text-navy-300 mb-2">{t.type === 'in' ? t.supplier : t.customerName} · {formatDateTime(t.date)}</p>
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-bold', t.type === 'in' ? 'text-green-600' : 'text-amber-600')}>{t.type === 'in' ? '+' : '-'}{t.quantity}</span>
                  <span className="text-sm font-semibold text-navy-700 dark:text-navy-100">{formatCurrency(t.quantity * t.unitPrice)}</span>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <TransactionDetailModal open={!!viewingTx} onClose={() => setViewingTx(null)} transaction={viewingTx} onEdit={handleEdit} onDelete={(t) => setDeletingTx(t)} />

      <StockInFormModal open={formType === 'in'} onClose={closeForm} transaction={editingTx} />
      <StockOutFormModal open={formType === 'out'} onClose={closeForm} transaction={editingTx} />

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
        onExportPdf={handleSelectionPdf}
        onExportExcel={handleSelectionExcel}
      />
    </div>
  );
}