import { useState, useMemo } from 'react';
import { Plus, ArrowUpFromLine } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../components/tables/DataTable';
import DataCardList from '../../components/tables/DataCardList';
import TableFilters from '../../components/tables/TableFilters';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StockOutFormModal from '../../components/transactions/StockOutFormModal';
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal';
import { useTransactionStore } from '../../store/transactionStore';
import { CLIENT_TYPES } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

export default function StockOut() {
  const allTransactions = useTransactionStore((state) => state.transactions);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);
  const transactions = useMemo(() => allTransactions.filter((t) => t.type === 'out'), [allTransactions]);

  const [search, setSearch] = useState('');
  const [clientType, setClientType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [viewingTx, setViewingTx] = useState(null);
  const [deletingTx, setDeletingTx] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = !search || t.productName.toLowerCase().includes(search.toLowerCase()) || t.customerName.toLowerCase().includes(search.toLowerCase()) || t.customerPhone.includes(search);
      const matchesType = !clientType || t.customerType === clientType;
      const txDate = t.date.slice(0, 10);
      const matchesFrom = !dateFrom || txDate >= dateFrom;
      const matchesTo = !dateTo || txDate <= dateTo;
      return matchesSearch && matchesType && matchesFrom && matchesTo;
    });
  }, [transactions, search, clientType, dateFrom, dateTo]);

  const activeFilterCount = (clientType ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    await deleteTransaction(deletingTx.id);
    setDeleting(false);
    setDeletingTx(null);
    setViewingTx(null);
    toast.success('Entry deleted and stock adjusted');
  };

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
    { accessorKey: 'quantity', header: 'Quantity', cell: ({ row }) => <span className="font-semibold text-amber-600">-{row.original.quantity}</span> },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-navy-700 dark:text-navy-100">{row.original.customerName}</p>
          <p className="text-xs text-navy-400 dark:text-navy-300">{row.original.customerPhone}</p>
        </div>
      ),
    },
    { accessorKey: 'customerType', header: 'Type', cell: ({ getValue }) => <Badge variant="navy" className="capitalize">{getValue()}</Badge> },
    { id: 'totalValue', header: 'Value', cell: ({ row }) => formatCurrency(row.original.quantity * row.original.unitPrice) },
    { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDateTime(getValue()) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-800 dark:text-white">Stock Out</h1>
          <p className="text-sm text-navy-400 dark:text-navy-300 mt-1">{transactions.length} entries recorded</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" /> Record Stock Out
        </Button>
      </div>

      <div className="rounded-2xl glass p-4 sm:p-5">
        <TableFilters search={search} onSearchChange={setSearch} placeholder="Search by product, customer, or phone..." activeCount={activeFilterCount}>
          <select value={clientType} onChange={(e) => setClientType(e.target.value)} className="h-9 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none capitalize">
            <option value="">All client types</option>
            {CLIENT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none" />
            <span className="text-xs text-navy-400">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none" />
          </div>
        </TableFilters>

        <DataTable columns={columns} data={filtered} onRowClick={setViewingTx} emptyMessage="No stock-out entries match your filters" />

        <DataCardList
          data={filtered}
          onCardClick={setViewingTx}
          emptyMessage="No stock-out entries match your filters"
          renderCard={(t) => (
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600">
                <ArrowUpFromLine className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy-800 dark:text-white truncate">{t.productName}</p>
                <p className="text-xs text-navy-400 dark:text-navy-300 mb-2">{t.customerName} · {formatDateTime(t.date)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-600">-{t.quantity}</span>
                  <span className="text-sm font-semibold text-navy-700 dark:text-navy-100">{formatCurrency(t.quantity * t.unitPrice)}</span>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <StockOutFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <TransactionDetailModal open={!!viewingTx} onClose={() => setViewingTx(null)} transaction={viewingTx} onDelete={(t) => setDeletingTx(t)} />

      <ConfirmDialog
        open={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete this entry?"
        description="This will remove the entry and restore the product's stock level accordingly."
      />
    </div>
  );
}